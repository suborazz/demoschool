const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const parentRoutes = require('./routes/parent');
const studentRoutes = require('./routes/student');
const publicRoutes = require('./routes/public');
const feeRoutes = require('./routes/fees');
const lmsRoutes = require('./routes/lms');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes = require('./routes/grades');

// Initialize express app
const app = express();

// Trust proxy for rate limiter
app.set('trust proxy', 1);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dav_school_db')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'DAV School Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// School info endpoint
app.get('/api/school-info', (req, res) => {
  res.json({
    name: process.env.SCHOOL_NAME || 'DAV School',
    phone: process.env.SCHOOL_PHONE || '+91 7488770476',
    email: process.env.SCHOOL_EMAIL || 'info@davschool.edu.in',
    address: process.env.SCHOOL_ADDRESS || 'India'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DAV School Management System Server running on port ${PORT}`);
  console.log(`📱 School Phone: ${process.env.SCHOOL_PHONE || '+91 7488770476'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

