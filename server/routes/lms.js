const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { single } = require('../middleware/upload');
const {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
  uploadFile,
  evaluateAssignment
} = require('../controllers/lmsController');

// Apply protection middleware
router.use(protect);

// File upload
router.post('/upload', authorize('admin', 'staff'), single('file'), uploadFile);

// Content management (admin and staff)
router.post('/content', authorize('admin', 'staff'), createContent);
router.get('/content', getAllContent);
router.get('/content/:id', getContentById);
router.put('/content/:id', authorize('admin', 'staff'), updateContent);
router.delete('/content/:id', authorize('admin', 'staff'), deleteContent);

// Assignment evaluation
router.put('/content/:contentId/evaluate/:submissionId', authorize('admin', 'staff'), evaluateAssignment);

module.exports = router;

