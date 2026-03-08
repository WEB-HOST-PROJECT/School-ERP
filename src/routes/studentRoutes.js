const router = require('express').Router()
const db = require('../database/init')

const {
    addStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    studentdWithFeeStructureById

} = require('../controller/studentController')


router.get('/', getAllStudents)

router.get('/:id', getStudentById)

router.post('/', addStudent)

router.put('/:id', updateStudent)

router.delete('/:id', deleteStudent)

router.get("/:id/fee-structure", studentdWithFeeStructureById)


module.exports = router;