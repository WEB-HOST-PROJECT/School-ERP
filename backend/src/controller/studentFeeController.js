const db = require('../database/init');
const feeService = require('../services/feeGeneratorService');

// Shared base query joining all relevant tables
const FULL_JOIN_SQL = `
    SELECT 
        sfr.*,
        s.name           AS student_name,
        ft.fee_type_name,
        ft.frequency,
        fs.amount        AS default_amount
    FROM student_fee_records sfr
    LEFT JOIN students      s  ON sfr.student_id      = s.id
    LEFT JOIN fee_structure fs  ON sfr.fee_structure_id = fs.id
    LEFT JOIN fee_types     ft  ON fs.fee_type_id       = ft.id
`;

// Create a single fee record (idempotent via INSERT OR IGNORE)
exports.createStudentFeeRecord = (req, res) => {
    const { student_id, fee_structure_id, month, due_date, amount, academic_year_id } = req.body;
    const sql = `INSERT OR IGNORE INTO student_fee_records (student_id, fee_structure_id, month, due_date, amount, academic_year_id) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [student_id, fee_structure_id, month, due_date, amount, academic_year_id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to create student fee record', details: err.message });
        res.status(201).json({ id: this.lastID, message: 'Fee record created successfully' });
    });
};

// All records for a specific student, ordered by month
exports.getStudentFeeRecordsByStudentId = (req, res) => {
    const { student_id } = req.params;
    const sql = FULL_JOIN_SQL + `WHERE sfr.student_id = ? ORDER BY sfr.due_date ASC, sfr.month ASC`;
    db.all(sql, [student_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// All records across all students
exports.getAllStudentFeeRecords = (req, res) => {
    const sql = FULL_JOIN_SQL + `ORDER BY sfr.due_date DESC, s.name ASC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// ── NEW: Due records only (for Monthly Demands tab) ──────────────────────────
// Returns records where due_date has arrived AND fee is not yet fully paid.
// Ordered: overdue first, then current month, then upcoming (excluded entirely).
exports.getDueRecords = (req, res) => {
    const sql = FULL_JOIN_SQL + `
        WHERE sfr.due_date IS NOT NULL
          AND date(sfr.due_date) <= date('now')
          AND sfr.status != 'paid'
        ORDER BY sfr.due_date ASC, s.name ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Due records for a specific student
exports.getDueRecordsByStudent = (req, res) => {
    const { student_id } = req.params;
    const sql = FULL_JOIN_SQL + `
        WHERE sfr.student_id = ?
          AND sfr.due_date IS NOT NULL
          AND date(sfr.due_date) <= date('now')
          AND sfr.status != 'paid'
        ORDER BY sfr.due_date ASC
    `;
    db.all(sql, [student_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Update a fee record (mark paid / set paid_amount)
exports.updateStudentFeeRecord = (req, res) => {
    const { id } = req.params;
    const { paid_amount, status } = req.body;
    const sql = `UPDATE student_fee_records SET paid_amount = ?, status = ? WHERE id = ?`;
    db.run(sql, [paid_amount, status || 'pending', id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Fee record not found' });
        res.json({ message: 'Fee record updated successfully' });
    });
};

// Manual trigger for monthly demand generation
exports.triggerMonthlyGeneration = (req, res) => {
    feeService.generateMonthlyDemands();
    res.status(200).json({ message: 'Monthly fee generation triggered.' });
};
