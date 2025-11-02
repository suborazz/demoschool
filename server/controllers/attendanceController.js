const AttendanceStaff = require('../models/AttendanceStaff');
const AttendanceStudent = require('../models/AttendanceStudent');

// @desc    Get staff attendance
// @route   GET /api/attendance/staff
// @access  Private/Admin/Staff
exports.getStaffAttendance = async (req, res) => {
  try {
    const { startDate, endDate, staff, status } = req.query;
    const filter = {};
    
    if (staff) filter.staff = staff;
    if (status) filter.status = status;
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await AttendanceStaff.find(filter)
      .populate({
        path: 'staff',
        populate: {
          path: 'user',
          select: '-password'
        }
      })
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Get staff attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff attendance'
    });
  }
};

// @desc    Get student attendance
// @route   GET /api/attendance/student
// @access  Private/Admin/Staff
exports.getStudentAttendance = async (req, res) => {
  try {
    const { startDate, endDate, student, class: classId, status } = req.query;
    const filter = {};
    
    if (student) filter.student = student;
    if (classId) filter.class = classId;
    if (status) filter.status = status;
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await AttendanceStudent.find(filter)
      .populate({
        path: 'student',
        populate: {
          path: 'user class',
          select: '-password'
        }
      })
      .populate('markedBy')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student attendance'
    });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:type/:id
// @access  Private/Admin
exports.updateAttendance = async (req, res) => {
  try {
    const { type, id } = req.params;

    let attendance;
    if (type === 'staff') {
      attendance = await AttendanceStaff.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
    } else if (type === 'student') {
      attendance = await AttendanceStudent.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance type'
      });
    }

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating attendance'
    });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:type/:id
// @access  Private/Admin
exports.deleteAttendance = async (req, res) => {
  try {
    const { type, id } = req.params;

    let attendance;
    if (type === 'staff') {
      attendance = await AttendanceStaff.findByIdAndDelete(id);
    } else if (type === 'student') {
      attendance = await AttendanceStudent.findByIdAndDelete(id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance type'
      });
    }

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting attendance'
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private/Admin/Staff
exports.getAttendanceStats = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let stats = {};

    if (type === 'staff' || !type) {
      const staffStats = await AttendanceStaff.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      stats.staff = staffStats;
    }

    if (type === 'student' || !type) {
      const studentStats = await AttendanceStudent.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      stats.student = studentStats;
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics'
    });
  }
};

