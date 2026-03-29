const express = require('express')
const router = express.Router()
const transportController = require('../controller/transportController')

router.post('/', transportController.addRoute)
router.get('/', transportController.getRoutes)
router.put('/:id', transportController.updateRoute)
router.delete('/:id', transportController.deleteRoute)

module.exports = router
