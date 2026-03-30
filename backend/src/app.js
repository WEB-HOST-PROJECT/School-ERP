const express = require('express')
const app = express()
const db = require('./database/init')
const cors = require('cors')
const feeGeneratorService = require('./services/feeGeneratorService')

feeGeneratorService.initScheduler();

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('GET request to the homepage')
});

app.use('/students', require('./routes/studentRoutes'))
app.use('/fee/structures', require('./routes/feeStructureRoutes'))
app.use('/academics', require('./routes/academicRoutes'))
app.use('/classes', require('./routes/classAndSectionRoutes'))
app.use('/fee/types', require('./routes/feeTypesRoutes'))
app.use('/enrollments', require('./routes/enrollmentRoutes'))
app.use('/payments', require('./routes/paymentRoutes'))
app.use('/transport', require('./routes/transportRoutes'))
app.use('/student-fees', require('./routes/studentFeeRoutes'))

module.exports = app;