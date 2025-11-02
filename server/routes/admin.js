const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllParents,
  createParent,
  updateParent,
  deleteParent,
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getReports,
  getAttendanceReport,
  getFeeReport,
  getSalaryReport
} = require('../controllers/adminController');

// All admin routes are protected and only accessible by admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// User management
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// Staff management
router.route('/staff')
  .get(getAllStaff)
  .post(createStaff);

router.route('/staff/:id')
  .put(updateStaff)
  .delete(deleteStaff);

// Student management
router.route('/students')
  .get(getAllStudents)
  .post(createStudent);

router.route('/students/:id')
  .put(updateStudent)
  .delete(deleteStudent);

// Parent management
router.route('/parents')
  .get(getAllParents)
  .post(createParent);

router.route('/parents/:id')
  .put(updateParent)
  .delete(deleteParent);

// Class management
router.route('/classes')
  .get(getAllClasses)
  .post(createClass);

router.route('/classes/:id')
  .put(updateClass)
  .delete(deleteClass);

// Subject management
router.route('/subjects')
  .get(getAllSubjects)
  .post(createSubject);

router.route('/subjects/:id')
  .put(updateSubject)
  .delete(deleteSubject);

// Reports
router.get('/reports', getReports);
router.get('/reports/attendance', getAttendanceReport);
router.get('/reports/fees', getFeeReport);
router.get('/reports/salary', getSalaryReport);

module.exports = router;

