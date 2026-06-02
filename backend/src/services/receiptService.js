const PDFDocument = require('pdfkit');
const db = require('../database/init');

class ReceiptService {
    /**
     * Generates a unique receipt number in format REC-YYYY-XXXX
     */
    async generateReceiptNumber() {
        const year = new Date().getFullYear();
        return new Promise((resolve, reject) => {
            const sql = `SELECT receipt_no FROM receipts WHERE receipt_no LIKE ? ORDER BY id DESC LIMIT 1`;
            db.get(sql, [`REC-${year}-%`], (err, row) => {
                if (err) return reject(err);
                
                let nextNumber = 1;
                if (row) {
                    const lastNum = parseInt(row.receipt_no.split('-')[2]);
                    if (!isNaN(lastNum)) {
                        nextNumber = lastNum + 1;
                    }
                }
                
                const formattedNum = String(nextNumber).padStart(4, '0');
                resolve(`REC-${year}-${formattedNum}`);
            });
        });
    }

    /**
     * Fetches complete receipt data including student and payment details
     */
    async getReceiptData(receiptId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    r.*, 
                    p.payment_date, p.total_amount as payment_total,
                    s.name as student_name, s.father_name, s.contact_no, s.address,
                    e.roll_no, c.class_name, sec.section_name,
                    ay.year_name as academic_year
                FROM receipts r
                JOIN payments p ON r.payment_id = p.id
                JOIN students s ON p.student_id = s.id
                LEFT JOIN enrollment e ON s.id = e.student_id AND e.academic_year_id = (
                    SELECT id FROM academic_years WHERE is_active = 1 LIMIT 1
                )
                LEFT JOIN classes c ON e.class_id = c.id
                LEFT JOIN sections sec ON e.section_id = sec.id
                LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
                WHERE r.id = ? OR r.receipt_no = ? OR r.payment_id = ?
            `;
            
            db.get(sql, [receiptId, receiptId, receiptId], (err, receipt) => {
                if (err) return reject(err);
                if (!receipt) return resolve(null);

                // Fetch fee details (payment details)
                const detailsSql = `
                    SELECT 
                        pd.amount,
                        ft.fee_type_name,
                        sfr.month
                    FROM payment_details pd
                    LEFT JOIN fee_structure fs ON pd.fee_structure_id = fs.id
                    LEFT JOIN fee_types ft ON fs.fee_type_id = ft.id
                    LEFT JOIN student_fee_records sfr ON pd.student_fee_record_id = sfr.id
                    WHERE pd.payment_id = ?
                `;
                
                db.all(detailsSql, [receipt.payment_id], (errDetails, details) => {
                    if (errDetails) return reject(errDetails);
                    
                    resolve({
                        receipt,
                        feeDetails: details,
                        school: {
                            name: "ABC Public School",
                            address: "Varanasi, Uttar Pradesh",
                            phone: "9876543210",
                            email: "info@abcpublicschool.edu",
                            website: "www.abcpublicschool.edu"
                        }
                    });
                });
            });
        });
    }

    /**
     * Generates a PDF buffer for a receipt
     */
    async generatePDF(receiptData) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const { receipt, feeDetails, school } = receiptData;

            // Header
            doc.fontSize(20).text(school.name, { align: 'center' });
            doc.fontSize(10).text(school.address, { align: 'center' });
            doc.text(`Phone: ${school.phone} | Email: ${school.email}`, { align: 'center' });
            doc.moveDown();
            
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            doc.fontSize(14).text('FEE RECEIPT', { align: 'center', underline: true });
            doc.moveDown();

            // Receipt Info
            const startY = doc.y;
            doc.fontSize(10);
            doc.text(`Receipt No: ${receipt.receipt_no}`, 50, startY);
            doc.text(`Date: ${receipt.receipt_date}`, 400, startY);
            doc.moveDown();

            // Student Info
            doc.fontSize(11).text('Student Details', { underline: true });
            doc.fontSize(10);
            doc.text(`Name: ${receipt.student_name}`, 50, doc.y + 5);
            doc.text(`Class: ${receipt.class_name || 'N/A'} - ${receipt.section_name || 'N/A'}`, 50, doc.y + 2);
            doc.text(`Roll No: ${receipt.roll_no || 'N/A'}`, 50, doc.y + 2);
            doc.text(`Father's Name: ${receipt.father_name || 'N/A'}`, 50, doc.y + 2);
            
            doc.moveDown();

            // Table Header
            const tableTop = doc.y;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Fee Description', 50, tableTop);
            doc.text('Month', 300, tableTop);
            doc.text('Amount (INR)', 450, tableTop, { width: 100, align: 'right' });
            
            doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
            doc.font('Helvetica');

            let currentY = doc.y + 15;
            feeDetails.forEach(item => {
                doc.text(item.fee_type_name || 'Other Fee', 50, currentY);
                doc.text(item.month || 'N/A', 300, currentY);
                doc.text(item.amount.toFixed(2), 450, currentY, { width: 100, align: 'right' });
                currentY += 20;
            });

            doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
            currentY += 10;

            // Total
            doc.font('Helvetica-Bold');
            doc.text('TOTAL PAID:', 300, currentY);
            doc.text(`INR ${receipt.total_amount.toFixed(2)}`, 450, currentY, { width: 100, align: 'right' });
            
            currentY += 30;
            doc.font('Helvetica');
            doc.text(`Payment Mode: ${receipt.payment_method}`, 50, currentY);
            if (receipt.remarks) {
                doc.text(`Remarks: ${receipt.remarks}`, 50, currentY + 15);
            }

            // Footer
            doc.fontSize(8).text('This is a computer generated receipt.', 50, 700, { align: 'center' });
            doc.text('Signature of Accountant', 450, 650);

            doc.end();
        });
    }
}

module.exports = new ReceiptService();
