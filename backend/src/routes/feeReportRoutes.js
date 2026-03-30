const express = require('express');
const router = express.Router();
const feeReportController = require('../controller/feeReportController');

// 1. Total due amount grouped by Class
router.get('/class-due', feeReportController.getClassWiseDue);

// 2. Collection history by Month
router.get('/monthly-collection', feeReportController.getMonthlyCollection);

// 3. Global Summary: Paid, Pending, Expected
router.get('/summary', feeReportController.getFeeSummary);

// 4. Overdue Students: Identifying students past their due_date
router.get('/overdue', feeReportController.getOverdueStudents);

module.exports = router;
