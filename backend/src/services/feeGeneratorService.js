const cron = require('node-cron');
const db = require('../database/init');

// ── Month format helpers ──────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pad = (n) => String(n).padStart(2, '0');

// → "Apr-2026"
const toMonthLabel = (year, monthIndex) => `${MONTH_NAMES[monthIndex]}-${year}`;

// Current month as label e.g. "Mar-2026"
const getCurrentMonthLabel = () => {
    const d = new Date();
    return toMonthLabel(d.getFullYear(), d.getMonth());
};

// Due date string for a month label, defaulting to the 10th
// "Apr-2026" → "2026-04-10"
const dueDateForLabel = (label, dayOfMonth = 10) => {
    const [mon, year] = label.split('-');
    const mi = MONTH_NAMES.indexOf(mon);
    if (mi === -1) return null;
    return `${year}-${pad(mi + 1)}-${pad(dayOfMonth)}`;
};

// ── Session month sequence ───────────────────────────────────────────────────
// Returns ordered array of month labels spanning start_date → end_date
// e.g. start=2026-04-01, end=2027-03-31 → ["Apr-2026","May-2026",...,"Mar-2027"]

const sessionMonths = (startDateStr, endDateStr) => {
    const start = new Date(startDateStr);
    const end   = new Date(endDateStr);

    const months = [];
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endBound = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cur <= endBound) {
        months.push(toMonthLabel(cur.getFullYear(), cur.getMonth()));
        cur.setMonth(cur.getMonth() + 1);
    }
    return months;
};

// Pick every Nth month from the sequence (for quarterly: N=3; yields 4 labels)
const everyNthMonth = (months, n) => months.filter((_, i) => i % n === 0);

// ── Core insert (idempotent) ─────────────────────────────────────────────────

const insertFeeRecord = (student_id, fee_structure_id, month, amount, academic_year_id, due_date) => {
    const finalDueDate = due_date || dueDateForLabel(month);
    const today = new Date().toISOString().split('T')[0];
    
    // Mark as 'due' if past date, otherwise 'upcoming'
    const initialStatus = (finalDueDate < today) ? 'due' : 'upcoming';

    const sql = `
        INSERT OR IGNORE INTO student_fee_records
            (student_id, fee_structure_id, month, due_date, amount, paid_amount, status, academic_year_id)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `;
    db.run(sql, [student_id, fee_structure_id, month, finalDueDate, amount, initialStatus, academic_year_id], (err) => {
        if (err) console.error(`[FeeService] Insert error s:${student_id} fs:${fee_structure_id} m:${month}:`, err.message);
    });
};

// ── Transport fee helper ─────────────────────────────────────────────────────
// Creates a virtual fee_structure row on-the-fly using transport.amount.
// Since transport fees have no fee_structure row, we insert them linked to the
// first matching fee_structure for the class (or you can add a dedicated transport
// fee_structure row in the UI — this handles both cases).

const assignTransportFees = (student_id, transport_id, academic_year_id, months) => {
    // Fetch the transport route's monthly amount
    db.get(`SELECT * FROM transport WHERE id = ?`, [transport_id], (err, route) => {
        if (err || !route) {
            console.error(`[FeeService] Transport route ${transport_id} not found:`, err?.message);
            return;
        }

        // Look for a fee_structure + fee_type named "transport" (case-insensitive)
        // If none exists, log + skip gracefully — admin should create a transport fee type
        const sql = `
            SELECT fs.id as fee_structure_id
            FROM fee_structure fs
            JOIN fee_types ft ON fs.fee_type_id = ft.id
            WHERE fs.academic_year_id = ? AND LOWER(ft.fee_type_name) LIKE '%transport%'
            LIMIT 1
        `;
        db.get(sql, [academic_year_id], (err, fs) => {
            if (err) { console.error('[FeeService] Transport fee_structure lookup error:', err.message); return; }

            if (!fs) {
                // Fallback: log advisory instead of silently skipping
                console.warn(`[FeeService] No "transport" fee_structure found for academic_year ${academic_year_id}. Create one in Fee Management to enable transport fee records.`);
                return;
            }

            months.forEach(month => {
                insertFeeRecord(student_id, fs.fee_structure_id, month, route.amount, academic_year_id, dueDateForLabel(month));
            });
            console.log(`[FeeService] Transport fees assigned (route: ${route.route_name}, ₹${route.amount}/month) for student ${student_id}`);
        });
    });
};

// ── Auto-assign fees for a fresh enrollment ──────────────────────────────────

const assignFeesForEnrollment = (student_id, class_id, academic_year_id, transport_id) => {
    console.log(`[FeeService] Assigning fees → student:${student_id} class:${class_id} year:${academic_year_id} transport:${transport_id}`);

    db.get(`SELECT * FROM academic_years WHERE id = ?`, [academic_year_id], (err, ay) => {
        if (err || !ay) { console.error('[FeeService] Academic year not found:', err?.message); return; }

        const months = sessionMonths(ay.start_date, ay.end_date);
        if (months.length === 0) {
            console.warn(`[FeeService] Academic year ${academic_year_id} produced 0 months (check start/end dates)`);
            return;
        }

        // Determine which months are quarterly checkpoints (every 3rd in the session)
        const quarterlyMonths = everyNthMonth(months, 3);

        // Fetch ALL fee structures for class × year, with fee_type metadata
        const sql = `
            SELECT fs.id AS fee_structure_id, fs.amount, ft.frequency, ft.fee_type_name, ft.id AS fee_type_id
            FROM fee_structure fs
            JOIN fee_types ft ON fs.fee_type_id = ft.id
            WHERE fs.class_id = ? AND fs.academic_year_id = ?
        `;
        db.all(sql, [class_id, academic_year_id], (err, structures) => {
            if (err) { console.error('[FeeService] Fee structures error:', err.message); return; }
            if (!structures || structures.length === 0) {
                console.log(`[FeeService] No fee structures for class:${class_id} year:${academic_year_id}`);
            }

            structures.forEach(fs => {
                const freq = (fs.frequency || '').toLowerCase().trim();

                // Skip transport-named fee types — they are handled separately below
                if (fs.fee_type_name.toLowerCase().includes('transport')) return;

                if (freq === 'monthly') {
                    months.forEach(month => {
                        insertFeeRecord(student_id, fs.fee_structure_id, month, fs.amount, academic_year_id);
                    });
                } else if (freq === 'quarterly') {
                    quarterlyMonths.forEach(month => {
                        insertFeeRecord(student_id, fs.fee_structure_id, month, fs.amount, academic_year_id);
                    });
                } else if (freq === 'yearly' || freq === 'annual' || freq === 'one-time') {
                    // Single record on the first month of the academic session
                    insertFeeRecord(student_id, fs.fee_structure_id, months[0], fs.amount, academic_year_id);
                } else {
                    // Unknown: insert once on the current month as fallback
                    insertFeeRecord(student_id, fs.fee_structure_id, getCurrentMonthLabel(), fs.amount, academic_year_id);
                }
            });

            // ── Transport fees (monthly, from transport table directly) ──
            if (transport_id) {
                assignTransportFees(student_id, transport_id, academic_year_id, months);
            }

            console.log(`[FeeService] Enrollment fee assignment done for student ${student_id} (${months.length} months in session)`);
        });
    });
};

// ── Monthly cron: generates the CURRENT month's demands for active students ──

const generateMonthlyDemands = () => {
    const currentLabel = getCurrentMonthLabel();
    console.log(`[FeeService] Monthly demand generation → ${currentLabel}`);

    const sql = `
        SELECT e.student_id, e.class_id, e.academic_year_id, e.transport_id,
               fs.id AS fee_structure_id, fs.amount,
               ft.frequency, ft.fee_type_name
        FROM enrollment e
        JOIN academic_years ay ON e.academic_year_id = ay.id AND ay.is_active = 1
        JOIN fee_structure  fs ON e.class_id = fs.class_id AND e.academic_year_id = fs.academic_year_id
        JOIN fee_types      ft ON fs.fee_type_id = ft.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) { console.error('[FeeService] Demand fetch error:', err.message); return; }
        if (!rows || rows.length === 0) { console.log('[FeeService] No active enrollments.'); return; }

        let count = 0;
        const [curMonName, curYear] = currentLabel.split('-');
        const curMonIndex = MONTH_NAMES.indexOf(curMonName); // 0-indexed

        rows.forEach(row => {
            const freq = (row.frequency || '').toLowerCase().trim();
            const isTransport = row.fee_type_name.toLowerCase().includes('transport');

            // Transport handled separately
            if (isTransport) return;

            let shouldInsert = false;
            if (freq === 'monthly') {
                shouldInsert = true;
            } else if (freq === 'quarterly') {
                // 0-indexed months 2,5,8,11 = Mar,Jun,Sep,Dec (standard) — but here we could also use session-relative
                shouldInsert = [2, 5, 8, 11].includes(curMonIndex);
            } else if (freq === 'yearly' || freq === 'annual') {
                shouldInsert = curMonIndex === 3; // April
            }

            if (shouldInsert) {
                insertFeeRecord(row.student_id, row.fee_structure_id, currentLabel, row.amount, row.academic_year_id, dueDateForLabel(currentLabel));
                count++;
            }
        });

        // Handle transport separately
        const transportStudents = [...new Set(rows.filter(r => r.transport_id).map(r => JSON.stringify({ student_id: r.student_id, transport_id: r.transport_id, academic_year_id: r.academic_year_id })))].map(s => JSON.parse(s));
        transportStudents.forEach(({ student_id, transport_id, academic_year_id }) => {
            assignTransportFees(student_id, transport_id, academic_year_id, [currentLabel]);
        });

        console.log(`[FeeService] Generated ${count} demand entries for ${currentLabel}`);
    });
};

// ── Scheduler ────────────────────────────────────────────────────────────────

const initScheduler = () => {
    cron.schedule('0 0 1 * *', generateMonthlyDemands);
    console.log('[FeeService] Cron scheduled: midnight on 1st of every month.');
};

module.exports = { initScheduler, generateMonthlyDemands, assignFeesForEnrollment };
