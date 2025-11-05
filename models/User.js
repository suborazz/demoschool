import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * USER MODEL - UNIQUENESS CONSTRAINTS
 * 
 * IMPORTANT: Only email is unique. Names can be duplicate!
 * 
 * This allows:
 * - Multiple users named "Rahul Kumar"
 * - Multiple users named "Robert Johnson"
 * - Same names across different roles (student, parent, staff)
 * 
 * Unique identifier: email address only
 */

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
    // NO unique constraint - duplicate names allowed
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
    // NO unique constraint - duplicate names allowed
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // ONLY email is unique
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  personalEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'parent', 'student'],
    required: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  profilePhoto: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.models.User || mongoose.model('User', userSchema);

