const express = require('express');
const router = express.Router();
const receiptController = require('../controller/receiptController');

router.get('/:receiptId', receiptController.getReceipt);
router.get('/student/:studentId', receiptController.getStudentReceipts);
router.get('/:receiptId/print', receiptController.printReceipt);
router.post('/generate', receiptController.generateReceiptManually);

module.exports = router;
