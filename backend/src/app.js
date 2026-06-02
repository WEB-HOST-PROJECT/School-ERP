const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const db = require('./database/init')
const feeGeneratorService = require('./services/feeGeneratorService')

const app = express()

// Security Middleware
app.use(helmet())

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
})
app.use('/api/', limiter)

feeGeneratorService.initScheduler();

// CORS configuration
const corsOptions = {
  origin: ['https://school-erp-edu.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() })
});

app.get('/', (req, res) => {
  res.send('School ERP API is running')
});

// Routes
app.use('/students', require('./routes/studentRoutes'))
app.use('/fee/structures', require('./routes/feeStructureRoutes'))
app.use('/academics', require('./routes/academicRoutes'))
app.use('/classes', require('./routes/classAndSectionRoutes'))
app.use('/fee/types', require('./routes/feeTypesRoutes'))
app.use('/enrollments', require('./routes/enrollmentRoutes'))
app.use('/payments', require('./routes/paymentRoutes'))
app.use('/transport', require('./routes/transportRoutes'))
app.use('/student-fees', require('./routes/studentFeeRoutes'))
app.use('/fee-reports', require('./routes/feeReportRoutes'))
app.use('/api/receipts', require('./routes/receiptRoutes'))

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" })
})

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  const status = err.statusCode || 500
  res.status(status).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  })
})

module.exports = app;