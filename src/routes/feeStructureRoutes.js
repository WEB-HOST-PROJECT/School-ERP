const router = require('express').Router()
const db = require('../database/init')

const {
    addFeeStructure,
    getAllFeeStructures,
    updateFeeStructure,
    deleteFeeStructure
} = require('../controller/feeStructureController')


// Get all fee structures
router.get('/', getAllFeeStructures)
// Get a fee structure by ID
// router.get('/find', getFeeStructureByClassAndSession)
// Add a new fee structure
router.post('/', addFeeStructure)
// // Update a fee structure
router.put('/:id', updateFeeStructure)
// // Delete a fee structure
router.delete('/:id', deleteFeeStructure)


module.exports = router;