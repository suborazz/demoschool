const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    required: true,
    enum: ['Unit Test', 'Mid Term', 'Final', 'Quarterly', 'Half Yearly', 'Annual', 'Assignment', 'Project']
  },
  examDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  passingMarks: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'E', 'F']
  },
  percentage: {
    type: Number
  },
  isPassed: {
    type: Boolean
  },
  rank: {
    type: Number
  },
  remarks: {
    type: String,
    trim: true
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  }
}, {
  timestamps: true
});

// Calculate percentage, grade, and pass status before saving
gradeSchema.pre('save', function(next) {
  // Calculate percentage
  this.percentage = (this.marksObtained / this.totalMarks) * 100;
  
  // Determine if passed
  this.isPassed = this.marksObtained >= this.passingMarks;
  
  // Calculate grade
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 80) this.grade = 'A';
  else if (this.percentage >= 70) this.grade = 'B+';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 50) this.grade = 'C+';
  else if (this.percentage >= 40) this.grade = 'C';
  else if (this.percentage >= 33) this.grade = 'D';
  else if (this.percentage >= 25) this.grade = 'E';
  else this.grade = 'F';
  
  next();
});

// Indexes
gradeSchema.index({ student: 1, academicYear: 1 });
gradeSchema.index({ class: 1, subject: 1, examType: 1 });

module.exports = mongoose.model('Grade', gradeSchema);

