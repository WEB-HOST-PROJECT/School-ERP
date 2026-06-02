const receiptService = require('../services/receiptService');
const db = require('../database/init');

const getReceipt = async (req, res) => {
    try {
        const { receiptId } = req.params;
        let receiptData = await receiptService.getReceiptData(receiptId);
        
        if (!receiptData) {
            // If not found, check if receiptId is a payment ID and try to generate it
            if (!isNaN(receiptId)) {
                return generateReceiptForPayment(receiptId, res);
            }
            return res.status(404).json({ error: 'Receipt not found' });
        }
        
        res.status(200).json(receiptData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch receipt', details: err.message });
    }
};

const generateReceiptForPayment = (paymentId, res) => {
    db.get('SELECT * FROM payments WHERE id = ?', [paymentId], async (err, payment) => {
        if (err || !payment) return res.status(404).json({ error: 'Payment not found' });

        db.get('SELECT id FROM academic_years WHERE is_active = 1 LIMIT 1', [], async (errAy, ay) => {
            const ay_id = ay ? ay.id : null;
            try {
                const receipt_no = await receiptService.generateReceiptNumber();
                const sql = `INSERT INTO receipts (payment_id, student_id, academic_year_id, receipt_no, receipt_date, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                db.run(sql, [paymentId, payment.student_id, ay_id, receipt_no, payment.payment_date, payment.total_amount, 'Auto-generated'], async function(errIns) {
                    if (errIns) return res.status(500).json({ error: 'Failed to generate receipt', details: errIns.message });
                    
                    const newData = await receiptService.getReceiptData(receipt_no);
                    res.status(200).json(newData);
                });
            } catch (e) {
                res.status(500).json({ error: 'Generation failed', details: e.message });
            }
        });
    });
};


const getStudentReceipts = (req, res) => {
    const { studentId } = req.params;
    const sql = `
        SELECT r.*, p.payment_date 
        FROM receipts r
        JOIN payments p ON r.payment_id = p.id
        WHERE p.student_id = ?
        ORDER BY r.id DESC
    `;
    db.all(sql, [studentId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch student receipts', details: err.message });
        res.status(200).json(rows);
    });
};

const printReceipt = async (req, res) => {
    try {
        const { receiptId } = req.params;
        let receiptData = await receiptService.getReceiptData(receiptId);
        
        if (!receiptData) {
            if (!isNaN(receiptId)) {
                // Try to generate it first
                db.get('SELECT * FROM payments WHERE id = ?', [receiptId], async (err, payment) => {
                    if (err || !payment) return res.status(404).json({ error: 'Receipt not found' });
                    
                    db.get('SELECT id FROM academic_years WHERE is_active = 1 LIMIT 1', [], async (errAy, ay) => {
                        const ay_id = ay ? ay.id : null;
                        try {
                            const receipt_no = await receiptService.generateReceiptNumber();
                            const sql = `INSERT INTO receipts (payment_id, student_id, academic_year_id, receipt_no, receipt_date, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                            db.run(sql, [receiptId, payment.student_id, ay_id, receipt_no, payment.payment_date, payment.total_amount, 'Auto-generated'], async function(errIns) {
                                if (errIns) return res.status(500).json({ error: 'Failed to generate receipt' });
                                const newData = await receiptService.getReceiptData(receipt_no);
                                const pdfBuffer = await receiptService.generatePDF(newData);
                                res.setHeader('Content-Type', 'application/pdf');
                                res.setHeader('Content-Disposition', `attachment; filename=receipt_${newData.receipt.receipt_no}.pdf`);
                                res.send(pdfBuffer);
                            });
                        } catch (e) { res.status(500).json({ error: 'PDF Generation failed' }); }
                    });
                });
                return;
            }
            return res.status(404).json({ error: 'Receipt not found' });
        }
        
        const pdfBuffer = await receiptService.generatePDF(receiptData);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt_${receiptData.receipt.receipt_no}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
    }
};


const generateReceiptManually = async (req, res) => {
    // This could be used to manually trigger receipt generation if it failed or for old payments
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId is required' });

    try {
        // Check if payment exists
        db.get('SELECT * FROM payments WHERE id = ?', [paymentId], async (err, payment) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!payment) return res.status(404).json({ error: 'Payment not found' });

            // Check if receipt already exists
            db.get('SELECT * FROM receipts WHERE payment_id = ?', [paymentId], async (errR, existing) => {
                if (errR) return res.status(500).json({ error: errR.message });
                if (existing) return res.status(400).json({ error: 'Receipt already exists for this payment', receipt_no: existing.receipt_no });

                db.get('SELECT id FROM academic_years WHERE is_active = 1 LIMIT 1', [], async (errAy, ay) => {
                    if (errAy) return res.status(500).json({ error: errAy.message });
                    const ay_id = ay ? ay.id : null;
                    
                    try {
                        const receipt_no = await receiptService.generateReceiptNumber();
                        const sql = `INSERT INTO receipts (payment_id, student_id, academic_year_id, receipt_no, receipt_date, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                        db.run(sql, [paymentId, payment.student_id, ay_id, receipt_no, payment.payment_date, payment.total_amount, 'Manual/Reprint'], function(errIns) {
                            if (errIns) return res.status(500).json({ error: 'Failed to insert receipt', details: errIns.message });
                            res.status(201).json({ message: 'Receipt generated', receipt_no });
                        });
                    } catch (e) {
                        res.status(500).json({ error: 'Failed to generate number', details: e.message });
                    }
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getReceipt,
    getStudentReceipts,
    printReceipt,
    generateReceiptManually
};
