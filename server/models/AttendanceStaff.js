const mongoose = require('mongoose');

const attendanceStaffSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: {
      type: Date,
      required: true
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    photo: {
      type: String, // URL to stored photo
      required: true
    },
    device: {
      userAgent: String,
      ip: String
    }
  },
  checkOut: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    photo: String
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'on_leave'],
    default: 'present'
  },
  workHours: {
    type: Number, // In hours
    default: 0
  },
  remarks: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for staff and date
attendanceStaffSchema.index({ staff: 1, date: 1 }, { unique: true });
attendanceStaffSchema.index({ date: 1 });
attendanceStaffSchema.index({ status: 1 });

// Calculate work hours before saving
attendanceStaffSchema.pre('save', function(next) {
  if (this.checkIn && this.checkIn.time && this.checkOut && this.checkOut.time) {
    const diff = this.checkOut.time - this.checkIn.time;
    this.workHours = diff / (1000 * 60 * 60); // Convert milliseconds to hours
  }
  next();
});

module.exports = mongoose.model('AttendanceStaff', attendanceStaffSchema);

