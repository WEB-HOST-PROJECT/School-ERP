const express = require('express');
const router = express.Router();
const studentFeeController = require('../controller/studentFeeController');

router.post('/generate-monthly', studentFeeController.triggerMonthlyGeneration);
router.post('/', studentFeeController.createStudentFeeRecord);
router.get('/all', studentFeeController.getAllStudentFeeRecords);
router.get('/due', studentFeeController.getDueRecords);
router.get('/due/:student_id', studentFeeController.getDueRecordsByStudent);
router.get('/:student_id', studentFeeController.getStudentFeeRecordsByStudentId);
router.put('/:id', studentFeeController.updateStudentFeeRecord);

module.exports = router;
