const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProfile,
  getChildren,
  getChildAttendance,
  getChildGrades,
  getChildFees,
  payFee,
  getNotifications
} = require('../controllers/parentController');

// All parent routes are protected and only accessible by parent role
router.use(protect);
router.use(authorize('parent'));

// Profile
router.get('/profile', getProfile);

// Children
router.get('/children', getChildren);
router.get('/children/:studentId/attendance', getChildAttendance);
router.get('/children/:studentId/grades', getChildGrades);
router.get('/children/:studentId/fees', getChildFees);

// Fee Payment
router.post('/fees/:feeId/pay', payFee);

// Notifications
router.get('/notifications', getNotifications);

module.exports = router;

