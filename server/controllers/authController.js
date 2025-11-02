const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Parent = require('../models/Parent');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (but in production, this should be restricted to admin)
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      address,
      dateOfBirth,
      gender
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      address,
      dateOfBirth,
      gender
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    // Get additional details based on role
    let additionalData = {};
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id })
        .populate('class')
        .populate('parents');
      additionalData.studentInfo = student;
    } else if (user.role === 'staff') {
      const staff = await Staff.findOne({ user: user._id })
        .populate('subjects')
        .populate('classes.class');
      additionalData.staffInfo = staff;
    } else if (user.role === 'parent') {
      const parent = await Parent.findOne({ user: user._id })
        .populate('children');
      additionalData.parentInfo = parent;
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user,
      ...additionalData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get additional details based on role
    let additionalData = {};
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id })
        .populate('class')
        .populate('parents');
      additionalData.studentInfo = student;
    } else if (user.role === 'staff') {
      const staff = await Staff.findOne({ user: user._id })
        .populate('subjects')
        .populate('classes.class');
      additionalData.staffInfo = staff;
    } else if (user.role === 'parent') {
      const parent = await Parent.findOne({ user: user._id })
        .populate('children');
      additionalData.parentInfo = parent;
    }

    res.json({
      success: true,
      user,
      ...additionalData
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, profilePhoto } = req.body;

    const fieldsToUpdate = {};
    if (firstName) fieldsToUpdate.firstName = firstName;
    if (lastName) fieldsToUpdate.lastName = lastName;
    if (phone) fieldsToUpdate.phone = phone;
    if (address) fieldsToUpdate.address = address;
    if (profilePhoto) fieldsToUpdate.profilePhoto = profilePhoto;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

