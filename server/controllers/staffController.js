const Staff = require('../models/Staff');
const Student = require('../models/Student');
const AttendanceStaff = require('../models/AttendanceStaff');
const AttendanceStudent = require('../models/AttendanceStudent');
const Salary = require('../models/Salary');
const Leave = require('../models/Leave');

// @desc    Get staff profile
// @route   GET /api/staff/profile
// @access  Private/Staff
exports.getProfile = async (req, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user.id })
      .populate('user', '-password')
      .populate('subjects')
      .populate('classes.class');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff profile not found'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// @desc    Mark self check-in attendance with GPS and photo
// @route   POST /api/staff/attendance/checkin
// @access  Private/Staff
exports.markSelfAttendance = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    // Get staff record
    const staff = await Staff.findOne({ user: req.user.id });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }

    // Check if already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await AttendanceStaff.findOne({
      staff: staff._id,
      date: { $gte: today }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }

    // Photo URL (in production, upload to cloud storage)
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required for attendance'
      });
    }

    // Create attendance record
    const attendance = await AttendanceStaff.create({
      staff: staff._id,
      date: new Date(),
      checkIn: {
        time: new Date(),
        location: {
          latitude,
          longitude,
          address
        },
        photo: photoUrl,
        device: {
          userAgent: req.headers['user-agent'],
          ip: req.ip
        }
      },
      status: 'present'
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance'
    });
  }
};

// @desc    Mark check-out attendance
// @route   POST /api/staff/attendance/checkout
// @access  Private/Staff
exports.checkOutAttendance = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    const staff = await Staff.findOne({ user: req.user.id });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }

    // Find today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await AttendanceStaff.findOne({
      staff: staff._id,
      date: { $gte: today }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No check-in found for today'
      });
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out for today'
      });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Update with check-out info
    attendance.checkOut = {
      time: new Date(),
      location: {
        latitude,
        longitude,
        address
      },
      photo: photoUrl
    };

    await attendance.save();

    res.json({
      success: true,
      message: 'Check-out recorded successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording check-out'
    });
  }
};

// @desc    Get my attendance records
// @route   GET /api/staff/attendance/my
// @access  Private/Staff
exports.getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const staff = await Staff.findOne({ user: req.user.id });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }

    const filter = { staff: staff._id };
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await AttendanceStaff.find(filter)
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance'
    });
  }
};

// @desc    Get salary details
// @route   GET /api/staff/salary
// @access  Private/Staff
exports.getSalaryDetails = async (req, res) => {
  try {
    const { month } = req.query;
    
    const staff = await Staff.findOne({ user: req.user.id });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }

    const filter = { staff: staff._id };
    if (month) {
      filter.month = month;
    }

    const salaries = await Salary.find(filter)
      .sort({ month: -1 })
      .limit(12); // Last 12 months

    res.json({
      success: true,
      count: salaries.length,
      data: salaries
    });
  } catch (error) {
    console.error('Get salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salary details'
    });
  }
};

// @desc    Mark student attendance
// @route   POST /api/staff/students/attendance
// @access  Private/Staff
exports.markStudentAttendance = async (req, res) => {
  try {
    const { students, date, classId } = req.body;

    const staff = await Staff.findOne({ user: req.user.id });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }

    // students should be an array of { studentId, status, remarks }
    const attendanceRecords = students.map(s => ({
      student: s.studentId,
      class: classId,
      date: date || new Date(),
      status: s.status,
      remarks: s.remarks,
      markedBy: staff._id
    }));

    // Use bulkWrite for better performance
    const operations = attendanceRecords.map(record => ({
      updateOne: {
        filter: { 
          student: record.student,
          date: record.date 
        },
        update: { $set: record },
        upsert: true
      }
    }));

    await AttendanceStudent.bulkWrite(operations);

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      count: attendanceRecords.length
    });
  } catch (error) {
    console.error('Mark student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance'
    });
  }
};

// @desc    Get students in a class
// @route   GET /api/staff/students/class/:classId
// @access  Private/Staff
exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const { section } = req.query;

    const filter = { class: classId, status: 'active' };
    if (section) {
      filter.section = section;
    }

    const students = await Student.find(filter)
      .populate('user', 'firstName lastName email profilePhoto')
      .sort({ rollNumber: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
};

// @desc    Apply for leave
// @route   POST /api/staff/leave/apply
// @access  Private/Staff
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, supportingDocument } = req.body;

    const leave = await Leave.create({
      user: req.user.id,
      userType: 'staff',
      leaveType,
      startDate,
      endDate,
      reason,
      supportingDocument
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting leave application'
    });
  }
};

// @desc    Get my leave records
// @route   GET /api/staff/leave/my
// @access  Private/Staff
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ 
      user: req.user.id,
      userType: 'staff'
    })
    .sort({ appliedDate: -1 })
    .populate('reviewedBy', 'firstName lastName');

    res.json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave records'
    });
  }
};

