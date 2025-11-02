const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  month: {
    type: String,
    required: true // Format: "YYYY-MM"
  },
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
    professionalTax: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  attendance: {
    totalWorkingDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 }
  },
  attendanceDeduction: {
    type: Number,
    default: 0
  },
  grossSalary: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'cheque']
  },
  transactionId: {
    type: String
  },
  remarks: {
    type: String,
    trim: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate salary before saving
salarySchema.pre('save', function(next) {
  // Calculate total allowances
  const totalAllowances = Object.values(this.allowances).reduce((sum, val) => sum + val, 0);
  
  // Calculate total deductions
  const totalDeductions = Object.values(this.deductions).reduce((sum, val) => sum + val, 0);
  
  // Calculate attendance deduction
  const perDaySalary = this.basicSalary / this.attendance.totalWorkingDays;
  this.attendanceDeduction = perDaySalary * (this.attendance.absentDays + (this.attendance.halfDays * 0.5));
  
  // Calculate gross salary
  this.grossSalary = this.basicSalary + totalAllowances;
  
  // Calculate net salary
  this.netSalary = this.grossSalary - totalDeductions - this.attendanceDeduction;
  
  next();
});

// Indexes
salarySchema.index({ staff: 1, month: 1 }, { unique: true });
salarySchema.index({ month: 1 });
salarySchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Salary', salarySchema);

