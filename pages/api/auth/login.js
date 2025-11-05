import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Student from '../../../models/Student';
import Staff from '../../../models/Staff';
import Parent from '../../../models/Parent';
import Class from '../../../models/Class';
import Subject from '../../../models/Subject';
import { generateToken } from '../../../lib/generateToken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email, passwordLength: password?.length });

    // Validate email and password
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ User found:', { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password 
    });

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password incorrect for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ Account inactive:', email);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    console.log('✅ Login successful for:', email);

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
}

