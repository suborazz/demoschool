const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['announcement', 'event', 'fee', 'grade', 'attendance', 'leave', 'general', 'urgent'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  recipients: {
    type: String,
    enum: ['all', 'admin', 'staff', 'parents', 'students', 'specific'],
    required: true
  },
  specificRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }],
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  attachments: [{
    fileName: String,
    fileUrl: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipients: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

