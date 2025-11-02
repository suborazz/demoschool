const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: {
    type: String,
    enum: ['staff', 'student'],
    required: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: ['sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid', 'other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  supportingDocument: {
    type: String // URL to document
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewRemarks: {
    type: String,
    trim: true
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate number of days before saving
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    this.numberOfDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }
  next();
});

// Indexes
leaveSchema.index({ user: 1, startDate: 1 });
leaveSchema.index({ status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);

