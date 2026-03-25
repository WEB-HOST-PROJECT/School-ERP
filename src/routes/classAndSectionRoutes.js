const router = require('express').Router()

const {
    addClass,
    getAllClasses,
    getClassById,
    deleteClass,

    addSection,
    getAllSections,
    getSectionById,
    deleteSection

} = require('../controller/classAndSectionController')

router.get('/class', getAllClasses)
router.get('/class/:id', getClassById)
router.post('/class', addClass)
router.delete('/class/:id', deleteClass)

router.get('/sections', getAllSections)
router.get('/sections/:id', getSectionById)
router.post('/sections', addSection)
router.delete('/sections/:id', deleteSection)


module.exports = router;