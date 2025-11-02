const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Parent = require('../models/Parent');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const AttendanceStaff = require('../models/AttendanceStaff');
const AttendanceStudent = require('../models/AttendanceStudent');
const Fee = require('../models/Fee');
const Salary = require('../models/Salary');
const Grade = require('../models/Grade');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
  try {
    // Get counts
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const totalStaff = await Staff.countDocuments({ status: 'active' });
    const totalParents = await Parent.countDocuments();
    const totalClasses = await Class.countDocuments({ isActive: true });

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const staffPresentToday = await AttendanceStaff.countDocuments({
      date: { $gte: today },
      status: 'present'
    });

    const studentsPresentToday = await AttendanceStudent.countDocuments({
      date: { $gte: today },
      status: 'present'
    });

    // Get fee statistics
    const totalFeesPending = await Fee.aggregate([
      { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amountPending' } } }
    ]);

    const totalFeesCollected = await Fee.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    // Get recent activities (last 10 records)
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName email')
      .populate('class', 'name grade');

    res.json({
      success: true,
      data: {
        counts: {
          students: totalStudents,
          staff: totalStaff,
          parents: totalParents,
          classes: totalClasses
        },
        attendance: {
          staffPresent: staffPresentToday,
          studentsPresent: studentsPresentToday
        },
        fees: {
          pending: totalFeesPending[0]?.total || 0,
          collected: totalFeesCollected[0]?.total || 0
        },
        recentActivities: recentStudents
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter).select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const user = await User.create(req.body);
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// Staff Management
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate('user', '-password')
      .populate('subjects')
      .populate('classes.class');

    res.json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff'
    });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    await staff.populate('user subjects classes.class');

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: staff
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating staff'
    });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user subjects classes.class');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff'
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff'
    });
  }
};

// Student Management
exports.getAllStudents = async (req, res) => {
  try {
    const { class: classId, section, status } = req.query;
    const filter = {};
    
    if (classId) filter.class = classId;
    if (section) filter.section = section;
    if (status) filter.status = status;

    const students = await Student.find(filter)
      .populate('user', '-password')
      .populate('class')
      .populate('parents');

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    await student.populate('user class parents');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating student'
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user class parents');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student'
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student'
    });
  }
};

// Parent Management
exports.getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate('user', '-password')
      .populate('children');

    res.json({
      success: true,
      count: parents.length,
      data: parents
    });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parents'
    });
  }
};

exports.createParent = async (req, res) => {
  try {
    const parent = await Parent.create(req.body);
    await parent.populate('user children');

    res.status(201).json({
      success: true,
      message: 'Parent created successfully',
      data: parent
    });
  } catch (error) {
    console.error('Create parent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating parent'
    });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user children');

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    res.json({
      success: true,
      message: 'Parent updated successfully',
      data: parent
    });
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating parent'
    });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findByIdAndDelete(req.params.id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    res.json({
      success: true,
      message: 'Parent deleted successfully'
    });
  } catch (error) {
    console.error('Delete parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting parent'
    });
  }
};

// Class Management
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher')
      .populate('subjects');

    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching classes'
    });
  }
};

exports.createClass = async (req, res) => {
  try {
    const classData = await Class.create(req.body);
    await classData.populate('classTeacher subjects');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: classData
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating class'
    });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('classTeacher subjects');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classData
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating class'
    });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting class'
    });
  }
};

// Subject Management
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('classes');

    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects'
    });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    await subject.populate('classes');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating subject'
    });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('classes');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subject'
    });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subject'
    });
  }
};

// Reports
exports.getReports = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Reports feature - Implementation in progress'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // Implementation for attendance report
    res.json({
      success: true,
      message: 'Attendance report - Implementation in progress'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance report'
    });
  }
};

exports.getFeeReport = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Fee report - Implementation in progress'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee report'
    });
  }
};

exports.getSalaryReport = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Salary report - Implementation in progress'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching salary report'
    });
  }
};

