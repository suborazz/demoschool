import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['holiday', 'exam', 'meeting', 'sports', 'cultural', 'academic', 'other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String // Format: "HH:MM"
  },
  endTime: {
    type: String // Format: "HH:MM"
  },
  location: {
    type: String,
    trim: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'staff', 'parents', 'specific_class'],
    default: 'all'
  },
  targetClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: 'blue'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ eventType: 1 });

export default mongoose.models.Event || mongoose.model('Event', eventSchema);

