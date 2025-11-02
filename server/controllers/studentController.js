const Student = require('../models/Student');
const AttendanceStudent = require('../models/AttendanceStudent');
const Grade = require('../models/Grade');
const Fee = require('../models/Fee');
const LMSContent = require('../models/LMSContent');
const Class = require('../models/Class');
const Notification = require('../models/Notification');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private/Student
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', '-password')
      .populate('class')
      .populate({
        path: 'parents',
        populate: { path: 'user', select: '-password' }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// @desc    Get my attendance
// @route   GET /api/student/attendance
// @access  Private/Student
exports.getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const filter = { student: student._id };
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await AttendanceStudent.find(filter)
      .sort({ date: -1 })
      .populate('markedBy', 'user')
      .limit(100);

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half_day').length,
      onLeave: attendance.filter(a => a.status === 'on_leave').length
    };

    stats.attendancePercentage = stats.total > 0 
      ? ((stats.present + stats.halfDay * 0.5) / stats.total * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: attendance,
      stats
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance'
    });
  }
};

// @desc    Get my grades
// @route   GET /api/student/grades
// @access  Private/Student
exports.getMyGrades = async (req, res) => {
  try {
    const { academicYear, examType } = req.query;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const filter = { student: student._id };
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;

    const grades = await Grade.find(filter)
      .sort({ examDate: -1 })
      .populate('subject', 'name code')
      .populate('class', 'name grade')
      .populate('enteredBy', 'firstName lastName');

    res.json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
};

// @desc    Get my fees
// @route   GET /api/student/fees
// @access  Private/Student
exports.getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const fees = await Fee.find({ student: student._id })
      .sort({ dueDate: -1 });

    const totalPending = fees.reduce((sum, fee) => sum + fee.amountPending, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);

    res.json({
      success: true,
      count: fees.length,
      data: fees,
      summary: {
        totalPending,
        totalPaid
      }
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fees'
    });
  }
};

// @desc    Get LMS content for my class
// @route   GET /api/student/lms
// @access  Private/Student
exports.getLMSContent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const { subject, category } = req.query;
    const filter = { 
      class: student.class,
      isActive: true
    };
    
    if (subject) filter.subject = subject;
    if (category) filter.category = category;

    const content = await LMSContent.find(filter)
      .sort({ publishDate: -1 })
      .populate('subject', 'name code')
      .populate('uploadedBy', 'firstName lastName');

    res.json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    console.error('Get LMS content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching LMS content'
    });
  }
};

// @desc    Access LMS content (track access)
// @route   GET /api/student/lms/:contentId/access
// @access  Private/Student
exports.accessLMSContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const content = await LMSContent.findById(contentId)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'firstName lastName');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Track access
    const accessIndex = content.studentAccess.findIndex(
      a => a.student.toString() === student._id.toString()
    );

    if (accessIndex === -1) {
      content.studentAccess.push({
        student: student._id,
        accessedAt: new Date()
      });
    } else {
      content.studentAccess[accessIndex].accessedAt = new Date();
    }

    content.accessCount += 1;
    await content.save();

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Access LMS content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing content'
    });
  }
};

// @desc    Submit assignment
// @route   POST /api/student/lms/:contentId/submit
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { fileUrl, remarks } = req.body;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const content = await LMSContent.findById(contentId);
    
    if (!content || content.category !== 'assignment') {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if already submitted
    const existingSubmission = content.assignment.submissions.find(
      s => s.student.toString() === student._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already submitted'
      });
    }

    // Add submission
    content.assignment.submissions.push({
      student: student._id,
      submittedAt: new Date(),
      fileUrl,
      remarks
    });

    await content.save();

    res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment'
    });
  }
};

// @desc    Get timetable
// @route   GET /api/student/timetable
// @access  Private/Student
exports.getTimetable = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const classData = await Class.findById(student.class)
      .populate('subjects')
      .populate({
        path: 'timetable.periods.subject',
        select: 'name code'
      })
      .populate({
        path: 'timetable.periods.teacher',
        populate: { path: 'user', select: 'firstName lastName' }
      });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classData.timetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable'
    });
  }
};

// @desc    Get notifications
// @route   GET /api/student/notifications
// @access  Private/Student
exports.getNotifications = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: 'students' },
        { specificRecipients: req.user.id },
        { class: student?.class }
      ],
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

