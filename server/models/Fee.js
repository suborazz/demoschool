const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  feeType: {
    type: String,
    required: true,
    enum: ['Tuition', 'Admission', 'Exam', 'Transport', 'Library', 'Sports', 'Laboratory', 'Annual', 'Other']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  amountPending: {
    type: Number,
    default: 0,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentHistory: [{
    amount: Number,
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking', 'razorpay', 'other']
    },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: String,
    receiptNumber: String
  }],
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  lateFee: {
    amount: {
      type: Number,
      default: 0
    },
    appliedDate: Date
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate pending amount before saving
feeSchema.pre('save', function(next) {
  this.amountPending = this.totalAmount - this.amountPaid + this.lateFee.amount - this.discount.amount;
  
  // Update status
  if (this.amountPending <= 0) {
    this.status = 'paid';
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
  
  next();
});

// Indexes
feeSchema.index({ student: 1, academicYear: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Fee', feeSchema);

