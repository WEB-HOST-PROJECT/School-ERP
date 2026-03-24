const router = require('express').Router()

const {
    addAcademicYear,
    getAllAcademicYears,
    // getAcademicYearById,
    // updateAcademicYear,
    // deleteAcademicYear

} = require('../controller/academicController')

router.get('/', getAllAcademicYears)
// router.get('/:id', getAcademicYearById)
router.post('/', addAcademicYear)
// router.put('/:id', updateAcademicYear)
// router.delete('/:id', deleteAcademicYear)

module.exports = router;