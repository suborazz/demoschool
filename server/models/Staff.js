const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Teaching', 'Administrative', 'Support', 'Management']
  },
  designation: {
    type: String,
    required: true
  },
  dateOfJoining: {
    type: Date,
    required: true,
    default: Date.now
  },
  qualification: {
    degree: String,
    specialization: String,
    university: String,
    year: Number
  },
  experience: {
    years: Number,
    previousInstitutions: [{
      name: String,
      designation: String,
      duration: String
    }]
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  classes: [{
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    section: String,
    isClassTeacher: {
      type: Boolean,
      default: false
    }
  }],
  salary: {
    basicSalary: {
      type: Number,
      required: true
    },
    allowances: {
      houseRent: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    deductions: {
      tax: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  bankDetails: {
    accountNumber: String,
    accountHolderName: String,
    ifscCode: String,
    bankName: String,
    branch: String
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'resigned', 'retired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
staffSchema.index({ employeeId: 1 });
staffSchema.index({ department: 1 });

module.exports = mongoose.model('Staff', staffSchema);

