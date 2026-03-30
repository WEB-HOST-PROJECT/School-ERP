const db = require('../database/init');

// 1. Total due amount grouped by Class
exports.getClassWiseDue = (req, res) => {
    const sql = `
        SELECT 
            c.class_name,
            SUM(sfr.amount - sfr.paid_amount) as total_due,
            COUNT(DISTINCT sfr.student_id) as student_count
        FROM student_fee_records sfr
        JOIN enrollment e ON sfr.student_id = e.student_id AND sfr.academic_year_id = e.academic_year_id
        JOIN classes c ON e.class_id = c.id
        WHERE sfr.status != 'paid'
        GROUP BY c.id
        ORDER BY c.class_name ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// 2. Total collections history grouped by Month
exports.getMonthlyCollection = (req, res) => {
    // We group by the payment_date's YYYY-MM
    const sql = `
        SELECT 
            strftime('%Y-%m', payment_date) as month,
            SUM(total_amount) as total_collected,
            COUNT(id) as transaction_count
        FROM payments
        GROUP BY month
        ORDER BY month DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// 3. Global Summary: Total Paid, Total Pending, Total Expected
exports.getFeeSummary = (req, res) => {
    const sql = `
        SELECT 
            SUM(amount) as total_expected,
            SUM(paid_amount) as total_collected,
            SUM(amount - paid_amount) as total_pending
        FROM student_fee_records
    `;
    db.get(sql, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
};

// 4. Overdue Students: List of students with unpaid records past their due_date
exports.getOverdueStudents = (req, res) => {
    const sql = `
        SELECT 
            s.id as student_id,
            s.name as student_name,
            c.class_name,
            COUNT(sfr.id) as overdue_months_count,
            SUM(sfr.amount - sfr.paid_amount) as total_overdue_amount
        FROM student_fee_records sfr
        JOIN students s ON sfr.student_id = s.id
        JOIN enrollment e ON s.id = e.student_id AND sfr.academic_year_id = e.academic_year_id
        JOIN classes c ON e.class_id = c.id
        WHERE sfr.status != 'paid'
          AND sfr.due_date IS NOT NULL
          AND date(sfr.due_date) < date('now')
        GROUP BY s.id
        ORDER BY total_overdue_amount DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};
