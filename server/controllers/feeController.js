const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Razorpay = require('razorpay');

// Initialize Razorpay (in production)
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// @desc    Create fee
// @route   POST /api/fees
// @access  Private/Admin
exports.createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: fee
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating fee'
    });
  }
};

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private/Admin/Staff
exports.getAllFees = async (req, res) => {
  try {
    const { student, status, feeType, academicYear } = req.query;
    const filter = {};
    
    if (student) filter.student = student;
    if (status) filter.status = status;
    if (feeType) filter.feeType = feeType;
    if (academicYear) filter.academicYear = academicYear;

    const fees = await Fee.find(filter)
      .populate('student')
      .populate({
        path: 'student',
        populate: {
          path: 'user class',
          select: '-password'
        }
      })
      .sort({ dueDate: -1 });

    res.json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fees'
    });
  }
};

// @desc    Get fee by ID
// @route   GET /api/fees/:id
// @access  Private/Admin/Staff/Parent
exports.getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('student')
      .populate({
        path: 'student',
        populate: {
          path: 'user class',
          select: '-password'
        }
      })
      .populate('paymentHistory.receivedBy', 'firstName lastName');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found'
      });
    }

    res.json({
      success: true,
      data: fee
    });
  } catch (error) {
    console.error('Get fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee'
    });
  }
};

// @desc    Update fee
// @route   PUT /api/fees/:id
// @access  Private/Admin
exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found'
      });
    }

    res.json({
      success: true,
      message: 'Fee updated successfully',
      data: fee
    });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fee'
    });
  }
};

// @desc    Delete fee
// @route   DELETE /api/fees/:id
// @access  Private/Admin
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found'
      });
    }

    res.json({
      success: true,
      message: 'Fee deleted successfully'
    });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fee'
    });
  }
};

// @desc    Record payment
// @route   POST /api/fees/:id/payment
// @access  Private/Admin/Parent
exports.recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, remarks } = req.body;

    const fee = await Fee.findById(req.params.id);
    
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found'
      });
    }

    const receiptNumber = `REC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    fee.paymentHistory.push({
      amount,
      paymentMethod,
      transactionId,
      paymentDate: new Date(),
      receivedBy: req.user.id,
      remarks,
      receiptNumber
    });

    fee.amountPaid += amount;
    await fee.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: fee,
      receiptNumber
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment'
    });
  }
};

// @desc    Create Razorpay order
// @route   POST /api/fees/:id/razorpay-order
// @access  Private/Parent
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // In production, create Razorpay order
    // const options = {
    //   amount: amount * 100, // amount in smallest currency unit
    //   currency: 'INR',
    //   receipt: `receipt_${Date.now()}`,
    //   payment_capture: 1
    // };
    // const order = await razorpay.orders.create(options);

    // For development, return mock order
    const order = {
      id: `order_${Date.now()}`,
      amount: amount * 100,
      currency: 'INR',
      status: 'created'
    };

    res.json({
      success: true,
      data: order,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_key'
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order'
    });
  }
};

