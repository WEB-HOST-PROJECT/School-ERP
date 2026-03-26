const router = require('express').Router()

const {
        addFeeType,
        getAllFeeTypes,
        getFeeTypeById,
        deleteFeeType

} = require('../controller/feeTypesController')


router.get('/', getAllFeeTypes)
router.get('/:id', getFeeTypeById)
router.post('/', addFeeType)
router.delete('/:id', deleteFeeType)

module.exports = router;