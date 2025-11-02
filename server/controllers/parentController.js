const Parent = require('../models/Parent');
const Student = require('../models/Student');
const AttendanceStudent = require('../models/AttendanceStudent');
const Grade = require('../models/Grade');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');

// @desc    Get parent profile
// @route   GET /api/parent/profile
// @access  Private/Parent
exports.getProfile = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user.id })
      .populate('user', '-password')
      .populate({
        path: 'children',
        populate: {
          path: 'user class',
          select: '-password'
        }
      });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// @desc    Get all children
// @route   GET /api/parent/children
// @access  Private/Parent
exports.getChildren = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user.id })
      .populate({
        path: 'children',
        populate: {
          path: 'user class',
          select: '-password'
        }
      });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    res.json({
      success: true,
      count: parent.children.length,
      data: parent.children
    });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching children'
    });
  }
};

// @desc    Get child's attendance
// @route   GET /api/parent/children/:studentId/attendance
// @access  Private/Parent
exports.getChildAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify this student belongs to this parent
    const parent = await Parent.findOne({ user: req.user.id });
    if (!parent || !parent.children.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filter = { student: studentId };
    
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

    res.json({
      success: true,
      data: attendance,
      stats
    });
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance'
    });
  }
};

// @desc    Get child's grades
// @route   GET /api/parent/children/:studentId/grades
// @access  Private/Parent
exports.getChildGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, examType } = req.query;

    // Verify this student belongs to this parent
    const parent = await Parent.findOne({ user: req.user.id });
    if (!parent || !parent.children.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filter = { student: studentId };
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
    console.error('Get child grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
};

// @desc    Get child's fees
// @route   GET /api/parent/children/:studentId/fees
// @access  Private/Parent
exports.getChildFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify this student belongs to this parent
    const parent = await Parent.findOne({ user: req.user.id });
    if (!parent || !parent.children.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const fees = await Fee.find({ student: studentId })
      .sort({ dueDate: -1 });

    // Calculate total pending and paid
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
    console.error('Get child fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fees'
    });
  }
};

// @desc    Pay fee (Razorpay integration)
// @route   POST /api/parent/fees/:feeId/pay
// @access  Private/Parent
exports.payFee = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { 
      amount, 
      paymentMethod, 
      transactionId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature 
    } = req.body;

    const fee = await Fee.findById(feeId).populate('student');
    
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Verify this fee belongs to parent's child
    const parent = await Parent.findOne({ user: req.user.id });
    if (!parent || !parent.children.includes(fee.student._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // In production, verify Razorpay signature here
    // const crypto = require('crypto');
    // const signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(razorpayOrderId + "|" + razorpayPaymentId)
    //   .digest('hex');
    // if (signature !== razorpaySignature) {
    //   return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    // }

    // Generate receipt number
    const receiptNumber = `REC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Add payment to history
    fee.paymentHistory.push({
      amount,
      paymentMethod,
      transactionId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentDate: new Date(),
      receivedBy: req.user.id,
      receiptNumber
    });

    // Update amount paid
    fee.amountPaid += amount;

    await fee.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: fee,
      receiptNumber
    });
  } catch (error) {
    console.error('Pay fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    });
  }
};

// @desc    Get notifications
// @route   GET /api/parent/notifications
// @access  Private/Parent
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: 'parents' },
        { specificRecipients: req.user.id }
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

