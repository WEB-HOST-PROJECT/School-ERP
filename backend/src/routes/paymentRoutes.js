const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/student/:studentId', paymentController.getPaymentsByStudent);

module.exports = router;
