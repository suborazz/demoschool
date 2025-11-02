const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, updateProfile);

module.exports = router;

