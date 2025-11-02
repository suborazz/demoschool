const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProfile,
  getMyAttendance,
  getMyGrades,
  getMyFees,
  getLMSContent,
  accessLMSContent,
  submitAssignment,
  getTimetable,
  getNotifications
} = require('../controllers/studentController');

// All student routes are protected and only accessible by student role
router.use(protect);
router.use(authorize('student'));

// Profile
router.get('/profile', getProfile);

// Attendance
router.get('/attendance', getMyAttendance);

// Grades
router.get('/grades', getMyGrades);

// Fees
router.get('/fees', getMyFees);

// LMS
router.get('/lms', getLMSContent);
router.get('/lms/:contentId/access', accessLMSContent);
router.post('/lms/:contentId/submit', submitAssignment);

// Timetable
router.get('/timetable', getTimetable);

// Notifications
router.get('/notifications', getNotifications);

module.exports = router;

