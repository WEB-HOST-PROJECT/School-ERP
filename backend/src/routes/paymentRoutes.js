const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

router.post('/multiple', paymentController.processMultiplePayments);
router.post('/advance', paymentController.processAdvancePayment);
router.post('/smart-allocate', paymentController.processSmartAllocation);
router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/student/:studentId', paymentController.getPaymentsByStudent);

module.exports = router;
