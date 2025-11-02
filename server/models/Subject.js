const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Core', 'Elective', 'Language', 'Science', 'Arts', 'Sports', 'Co-curricular'],
    default: 'Core'
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  totalMarks: {
    type: Number,
    default: 100
  },
  passingMarks: {
    type: Number,
    default: 33
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);

