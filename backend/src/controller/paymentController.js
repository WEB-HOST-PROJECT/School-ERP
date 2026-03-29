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
            const insertDetailSql = `INSERT INTO payment_details (payment_id, fee_type_id, amount) VALUES (?, ?, ?)`;
            let detailsInserted = 0;
            let hasError = false;

            if (payment_details.length === 0) {
                // If no details, proceed to receipt
                createReceipt(payment_id);
            }

            payment_details.forEach((detail, index) => {
                db.run(insertDetailSql, [payment_id, detail.fee_type_id, detail.amount], function(errDetail) {
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

module.exports = {
    createPayment,
    getAllPayments,
    getPaymentsByStudent
};
