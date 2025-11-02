const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStaffAttendance,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

// Apply protection middleware
router.use(protect);

// Staff attendance (admin and staff can view)
router.get('/staff', authorize('admin', 'staff'), getStaffAttendance);

// Student attendance (admin and staff can view)
router.get('/student', authorize('admin', 'staff'), getStudentAttendance);

// Update attendance (admin only)
router.put('/:type/:id', authorize('admin'), updateAttendance);

// Delete attendance (admin only)
router.delete('/:type/:id', authorize('admin'), deleteAttendance);

// Attendance statistics (admin and staff)
router.get('/stats', authorize('admin', 'staff'), getAttendanceStats);

module.exports = router;

