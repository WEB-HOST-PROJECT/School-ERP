const router = require('express').Router()

const {
    addEnrollment,
    getAllEnrollments,
    getEnrollmentById,
    updateEnrollment,
    deleteEnrollment,
    getEnrollmentDetailsById

} = require('../controller/enrollmentController')

router.get('/', getAllEnrollments)

router.get('/:id', getEnrollmentById)

router.get('/details/:id', getEnrollmentDetailsById)

router.post('/', addEnrollment)
router.put('/:id', updateEnrollment)
router.delete('/:id', deleteEnrollment)


module.exports = router;