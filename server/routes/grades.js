const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
  getGradesByStudent,
  getGradesByClass
} = require('../controllers/gradeController');

// Apply protection middleware
router.use(protect);

// Admin and staff can manage grades
router.post('/', authorize('admin', 'staff'), createGrade);
router.get('/', authorize('admin', 'staff'), getAllGrades);
router.get('/:id', authorize('admin', 'staff'), getGradeById);
router.put('/:id', authorize('admin', 'staff'), updateGrade);
router.delete('/:id', authorize('admin'), deleteGrade);

// Get grades by student or class
router.get('/student/:studentId', authorize('admin', 'staff', 'parent', 'student'), getGradesByStudent);
router.get('/class/:classId', authorize('admin', 'staff'), getGradesByClass);

module.exports = router;

