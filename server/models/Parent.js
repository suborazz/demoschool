const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relation: {
    type: String,
    required: true,
    enum: ['father', 'mother', 'guardian']
  },
  occupation: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  annualIncome: {
    type: Number
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  alternatePhone: {
    type: String,
    trim: true
  },
  officePhone: {
    type: String,
    trim: true
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  isPrimaryContact: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Parent', parentSchema);

