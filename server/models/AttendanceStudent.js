const mongoose = require('mongoose');

const attendanceStudentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'on_leave'],
    default: 'present',
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  period: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for student and date
attendanceStudentSchema.index({ student: 1, date: 1 });
attendanceStudentSchema.index({ class: 1, date: 1 });
attendanceStudentSchema.index({ date: 1 });

module.exports = mongoose.model('AttendanceStudent', attendanceStudentSchema);

