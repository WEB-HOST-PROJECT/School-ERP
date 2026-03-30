const db = require('../database/init');

const createPayment = (req, res) => {
    const { student_id, payment_date, fee_structure_id, total_amount, payment_method, remarks, payment_details } = req.body;

    if (!student_id || !payment_date || !fee_structure_id || !total_amount || !payment_method || !payment_details || !Array.isArray(payment_details)) {
        return res.status(400).json({ error: 'Missing required fields or invalid payment details format' });
    }

    // Use transaction semantics manually via db.serialize
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const insertPaymentSql = `INSERT INTO payments (student_id, payment_date, fee_structure_id, total_amount) VALUES (?, ?, ?, ?)`;
        db.run(insertPaymentSql, [student_id, payment_date, fee_structure_id, total_amount], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to insert payment', details: err.message });
            }

            const payment_id = this.lastID;
            const insertDetailSql = `INSERT INTO payment_details (payment_id, fee_structure_id, amount) VALUES (?, ?, ?)`;
            let detailsInserted = 0;
            let hasError = false;

            if (payment_details.length === 0) {
                // If no details, proceed to receipt
                createReceipt(payment_id);
            }

            payment_details.forEach((detail, index) => {
                db.run(insertDetailSql, [payment_id, detail.fee_structure_id, detail.amount], function(errDetail) {
                    if (errDetail) {
                        hasError = true;
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Failed to insert payment details', details: errDetail.message });
                    }
                    detailsInserted++;
                    if (detailsInserted === payment_details.length && !hasError) {
                        createReceipt(payment_id);
                    }
                });
            });

            function createReceipt(pid) {
                const receipt_no = 'REC-' + Date.now() + Math.floor(Math.random() * 1000);
                const insertReceiptSql = `INSERT INTO receipts (payment_id, receipt_no, receipt_date, total_amount, payment_method, remarks) VALUES (?, ?, ?, ?, ?, ?)`;
                
                db.run(insertReceiptSql, [pid, receipt_no, payment_date, total_amount, payment_method, remarks], function(errReceipt) {
                    if (errReceipt) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Failed to generate receipt', details: errReceipt.message });
                    }
                    
                    db.run('COMMIT');
                    res.status(201).json({ 
                        message: 'Payment processed successfully', 
                        payment_id: pid, 
                        receipt_no: receipt_no 
                    });
                });
            }
        });
    });
};

const getAllPayments = (req, res) => {
    const sql = `
        SELECT p.*, r.receipt_no, r.payment_method, s.name as student_name
        FROM payments p
        LEFT JOIN receipts r ON p.id = r.payment_id
        LEFT JOIN students s ON p.student_id = s.id
        ORDER BY p.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
};

const getPaymentsByStudent = (req, res) => {
    const { studentId } = req.params;
    const sql = `
        SELECT p.*, r.receipt_no, r.payment_method
        FROM payments p
        LEFT JOIN receipts r ON p.id = r.payment_id
        WHERE p.student_id = ?
        ORDER BY p.id DESC
    `;
    db.all(sql, [studentId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
};

const processMultiplePayments = (req, res) => {
    const { student_id, payment_date, payment_method, remarks, fee_record_ids } = req.body;

    if (!student_id || !payment_date || !payment_method || !Array.isArray(fee_record_ids) || fee_record_ids.length === 0) {
        return res.status(400).json({ error: 'Missing required fields or empty fee_record_ids' });
    }

    // Step 1: Fetch all selected student_fee_records to compute totals and validate
    const placeholders = fee_record_ids.map(() => '?').join(',');
    const fetchSql = `SELECT * FROM student_fee_records WHERE id IN (${placeholders}) AND student_id = ?`;

    db.all(fetchSql, [...fee_record_ids, student_id], (err, records) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch fee records', details: err.message });
        if (!records || records.length === 0) return res.status(404).json({ error: 'No valid fee records found' });

        // Filter out already fully paid records and compute per-record due amounts
        const payable = records
            .filter(r => r.status !== 'paid')
            .map(r => ({
                ...r,
                due: parseFloat(r.amount) - parseFloat(r.paid_amount || 0)
            }))
            .filter(r => r.due > 0);

        if (payable.length === 0) {
            return res.status(400).json({ error: 'All selected records are already fully paid' });
        }

        const total_amount = payable.reduce((sum, r) => sum + r.due, 0);

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Step 2: Insert parent payment
            const insertPayment = `INSERT INTO payments (student_id, payment_date, fee_structure_id, total_amount) VALUES (?, ?, ?, ?)`;
            db.run(insertPayment, [student_id, payment_date, payable[0].fee_structure_id, total_amount], function(err) {
                if (err) { db.run('ROLLBACK'); return res.status(500).json({ error: 'Failed to create payment', details: err.message }); }

                const payment_id = this.lastID;
                let completed = 0;
                let failed = false;

                payable.forEach((record) => {
                    // Step 3: Insert payment_detail row
                    const detailSql = `INSERT INTO payment_details (payment_id, student_fee_record_id, fee_structure_id, amount) VALUES (?, ?, ?, ?)`;
                    db.run(detailSql, [payment_id, record.id, record.fee_structure_id, record.due], function(detailErr) {
                        if (detailErr && !failed) {
                            failed = true;
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Failed to insert payment detail', details: detailErr.message });
                        }

                        // Step 4: Update student_fee_record status
                        const new_paid = parseFloat(record.paid_amount || 0) + record.due;
                        const new_status = new_paid >= parseFloat(record.amount) ? 'paid' : 'partial';
                        const updateSql = `UPDATE student_fee_records SET paid_amount = ?, status = ? WHERE id = ?`;
                        db.run(updateSql, [new_paid, new_status, record.id], (updateErr) => {
                            if (updateErr && !failed) {
                                failed = true;
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Failed to update fee record', details: updateErr.message });
                            }
                            completed++;
                            if (completed === payable.length && !failed) {
                                // Step 5: Generate receipt
                                const receipt_no = 'REC-' + Date.now() + Math.floor(Math.random() * 1000);
                                const receiptSql = `INSERT INTO receipts (payment_id, receipt_no, receipt_date, total_amount, payment_method, remarks) VALUES (?, ?, ?, ?, ?, ?)`;
                                db.run(receiptSql, [payment_id, receipt_no, payment_date, total_amount, payment_method, remarks || ''], (rErr) => {
                                    if (rErr) { db.run('ROLLBACK'); return res.status(500).json({ error: 'Failed to generate receipt', details: rErr.message }); }
                                    db.run('COMMIT');
                                    res.status(201).json({
                                        message: `Payment processed for ${payable.length} fee record(s)`,
                                        payment_id,
                                        receipt_no,
                                        total_amount
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    });
};

// Smart Allocation — distributes a lump sum sequentially across OLDEST unpaid dues first (FIFO)
const processSmartAllocation = (req, res) => {
    const { student_id, payment_date, payment_method, remarks, total_amount } = req.body;

    if (!student_id || !payment_date || !payment_method || !total_amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const amount = parseFloat(total_amount);
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Fetch all unpaid/partial records for this student, ordered by due_date ASC (FIFO)
    const fetchSql = `SELECT * FROM student_fee_records WHERE student_id = ? AND status != 'paid' ORDER BY due_date ASC, id ASC`;

    db.all(fetchSql, [student_id], (err, records) => {
        if (err) return res.status(500).json({ error: 'Database fetch error', details: err.message });
        if (!records || records.length === 0) return res.status(404).json({ error: 'No unpaid fee records found for this student' });

        // Map and calculate exact due for each record
        const payable = records.map(r => ({
            ...r,
            due: Math.max(0, parseFloat(r.amount) - parseFloat(r.paid_amount || 0))
        })).filter(r => r.due > 0);

        if (payable.length === 0) return res.status(400).json({ error: 'Student has no outstanding balance' });

        // Cap the payment at the total outstanding balance
        const totalOutstanding = payable.reduce((s, r) => s + r.due, 0);
        const amountToPay = Math.min(amount, totalOutstanding);

        // Distribute the amount
        let remaining = amountToPay;
        const distributions = [];
        for (const record of payable) {
            if (remaining <= 0) break;
            const paying = Math.min(remaining, record.due);
            distributions.push({ record, paying });
            remaining -= paying;
        }

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // 1. Insert parent payment record
            const insertPayment = `INSERT INTO payments (student_id, payment_date, fee_structure_id, total_amount) VALUES (?, ?, ?, ?)`;
            // Note: fee_structure_id is required in schema, so we use the first record's vs creating a dummy
            db.run(insertPayment, [student_id, payment_date, distributions[0].record.fee_structure_id, amountToPay], function(payErr) {
                if (payErr) { db.run('ROLLBACK'); return res.status(500).json({ error: 'Failed to create payment', details: payErr.message }); }

                const payment_id = this.lastID;
                let completed = 0;
                let failed = false;

                distributions.forEach(({ record, paying }) => {
                    // 2. Insert payment_detail for each allocated record
                    const detailSql = `INSERT INTO payment_details (payment_id, student_fee_record_id, fee_structure_id, amount) VALUES (?, ?, ?, ?)`;
                    db.run(detailSql, [payment_id, record.id, record.fee_structure_id, paying], function(detErr) {
                        if (detErr && !failed) {
                            failed = true; db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Allocation failed locally', details: detErr.message });
                        }

                        // 3. Update student_fee_record
                        const new_paid = parseFloat(record.paid_amount || 0) + paying;
                        const new_status = new_paid >= parseFloat(record.amount) ? 'paid' : 'partial';
                        db.run(`UPDATE student_fee_records SET paid_amount = ?, status = ? WHERE id = ?`, [new_paid, new_status, record.id], (updErr) => {
                            if (updErr && !failed) {
                                failed = true; db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Record update failed', details: updErr.message });
                            }

                            completed++;
                            if (completed === distributions.length && !failed) {
                                // 4. Finalize Receipt
                                const receipt_no = 'SMP-' + Date.now() + Math.floor(Math.random() * 1000);
                                db.run(
                                    `INSERT INTO receipts (payment_id, receipt_no, receipt_date, total_amount, payment_method, remarks) VALUES (?, ?, ?, ?, ?, ?)`,
                                    [payment_id, receipt_no, payment_date, amountToPay, payment_method, remarks || 'Smart Allocation'],
                                    (rErr) => {
                                        if (rErr) { db.run('ROLLBACK'); return res.status(500).json({ error: 'Receipt generation failed' }); }
                                        db.run('COMMIT');
                                        res.status(201).json({
                                            message: `Smart allocation successful! ₹${amountToPay.toFixed(2)} distributed over ${distributions.length} record(s).`,
                                            payment_id, receipt_no, amount_paid: amountToPay, records_count: distributions.length
                                        });
                                    }
                                );
                            }
                        });
                    });
                });
            });
        });
    });
};

module.exports = {
    createPayment,
    getAllPayments,
    getPaymentsByStudent,
    processMultiplePayments,
    processAdvancePayment,
    processSmartAllocation
};
