import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  section: {
    type: String,
    trim: true,
    default: 'A'
  },
  sections: [{
    type: String,
    trim: true
  }],
  capacity: {
    type: Number,
    default: 40,
    min: 1
  },
  room: {
    type: String,
    trim: true,
    default: ''
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  academicYear: {
    type: String,
    required: true
  },
  timetable: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    periods: [{
      periodNumber: Number,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      startTime: String,
      endTime: String
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
classSchema.index({ grade: 1, academicYear: 1 });

export default mongoose.models.Class || mongoose.model('Class', classSchema);

