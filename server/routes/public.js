const express = require('express');
const router = express.Router();
const {
  getSchoolInfo,
  submitContactForm,
  submitAdmissionInquiry,
  getGallery,
  getAnnouncements
} = require('../controllers/publicController');

// Public routes (no authentication required)
router.get('/school-info', getSchoolInfo);
router.post('/contact', submitContactForm);
router.post('/admission-inquiry', submitAdmissionInquiry);
router.get('/gallery', getGallery);
router.get('/announcements', getAnnouncements);

module.exports = router;

