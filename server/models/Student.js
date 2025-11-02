const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  },
  dateOfAdmission: {
    type: Date,
    required: true,
    default: Date.now
  },
  previousSchool: {
    name: String,
    location: String
  },
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  }],
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  medicalInfo: {
    allergies: [String],
    medications: [String],
    conditions: [String],
    doctorName: String,
    doctorPhone: String
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'transferred'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
studentSchema.index({ admissionNumber: 1 });
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ academicYear: 1 });

module.exports = mongoose.model('Student', studentSchema);

