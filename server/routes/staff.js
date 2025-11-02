const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { attendancePhoto } = require('../middleware/upload');
const {
  getProfile,
  markSelfAttendance,
  checkOutAttendance,
  getMyAttendance,
  getSalaryDetails,
  markStudentAttendance,
  getClassStudents,
  applyLeave,
  getMyLeaves
} = require('../controllers/staffController');

// All staff routes are protected and only accessible by staff role
router.use(protect);
router.use(authorize('staff'));

// Profile
router.get('/profile', getProfile);

// Self Attendance
router.post('/attendance/checkin', attendancePhoto, markSelfAttendance);
router.post('/attendance/checkout', attendancePhoto, checkOutAttendance);
router.get('/attendance/my', getMyAttendance);

// Salary
router.get('/salary', getSalaryDetails);

// Student Attendance
router.post('/students/attendance', markStudentAttendance);
router.get('/students/class/:classId', getClassStudents);

// Leave Management
router.post('/leave/apply', applyLeave);
router.get('/leave/my', getMyLeaves);

module.exports = router;

