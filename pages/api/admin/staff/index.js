import connectDB from '../../../../lib/mongodb';
import Staff from '../../../../models/Staff';
import User from '../../../../models/User';
import { verify } from 'jsonwebtoken';

/**
 * STAFF MANAGEMENT API - UNIQUENESS STRATEGY
 * 
 * This API handles multiple staff members with the same name correctly.
 * 
 * WHAT IS UNIQUE:
 * - Employee ID (auto-generated, globally unique) - e.g., EMP20240001
 * - Email addresses (official email) - must be unique across all users
 * 
 * WHAT CAN BE DUPLICATE:
 * - Staff names (firstName, lastName) - Multiple "John Smith" teachers allowed
 * - Phone numbers - Can be same (though not recommended)
 * - Personal emails - Can be same (optional field)
 * - Addresses - Can be same
 * - Designations - Multiple "Senior Teacher" or "Principal" allowed
 * 
 * EXAMPLES THAT WORK:
 * 1. Two teachers both named "Rajesh Kumar" (different emails)
 * 2. Multiple staff with designation "Senior Teacher" (different emails)
 * 3. Staff members with same phone or address (different emails)
 * 
 * The system uses employee IDs and emails as primary unique identifiers.
 */

// Helper function to generate Employee ID
async function generateEmployeeId() {
  const currentYear = new Date().getFullYear();
  const prefix = 'EMP';
  
  // Find the last employee ID for the current year
  const lastStaff = await Staff.findOne({
    employeeId: new RegExp(`^${prefix}${currentYear}`)
  }).sort({ createdAt: -1 });

  if (lastStaff) {
    // Extract the sequence number and increment
    const lastSequence = parseInt(lastStaff.employeeId.slice(-4));
    const newSequence = (lastSequence + 1).toString().padStart(4, '0');
    return `${prefix}${currentYear}${newSequence}`;
  } else {
    // First employee of the year
    return `${prefix}${currentYear}0001`;
  }
}

export default async function handler(req, res) {
  try {
    await connectDB();

    // Verify admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided. Please login again.' });
    }

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
      console.log('Token decoded, userId:', decoded.id || decoded.userId);
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
    }

    // Use decoded.id (from generateToken) or decoded.userId (fallback)
    const userId = decoded.id || decoded.userId;
    const adminUser = await User.findById(userId);
    console.log('User found:', adminUser ? 'Yes' : 'No');
    console.log('User role:', adminUser?.role);
    
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'User not found. Please login again.' });
    }
    
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Admin role required. Your role: ${adminUser.role}` 
      });
    }

    // GET - Fetch all staff
    if (req.method === 'GET') {
      const staff = await Staff.find()
        .populate('user', 'firstName lastName email personalEmail phone gender dateOfBirth address isActive')
        .populate('subjects')
        .populate('classes.class')
        .sort({ createdAt: -1 });

      console.log('Fetched staff count:', staff.length);

      return res.status(200).json({
        success: true,
        count: staff.length,
        data: staff
      });
    }

    // POST - Create new staff
    if (req.method === 'POST') {
      const {
        // User fields
        firstName,
        lastName,
        email,
        password,
        phone,
        personalEmail,
        dateOfBirth,
        gender,
        address,
        // Staff fields
        department,
        designation,
        dateOfJoining,
        qualification,
        experience,
        salary,
        bankDetails,
        alternateContact,
        emergencyContact
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required personal information (First Name, Last Name, Email, Password, Phone)'
        });
      }

      if (!department || !designation || !salary?.basicSalary) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required staff fields (Department, Designation, Basic Salary)'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // IMPORTANT: We only check unique identifiers, NOT names
      // Multiple staff can have the same name
      // Uniqueness is based on: email and employee ID only
      
      // Check if email already exists (emails must be unique)
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered. Please use a different email address.'
        });
      }

      // Generate Employee ID automatically
      const employeeId = await generateEmployeeId();

      // Store credentials for response
      const credentials = {
        employeeId: employeeId,
        email: email.toLowerCase(),
        password: password
      };

      // Create user account for staff
      // Note: Names can be duplicate - uniqueness enforced by email only
      const newUser = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        personalEmail: personalEmail ? personalEmail.toLowerCase() : '',
        dateOfBirth,
        gender,
        address: address || {},
        role: 'staff',
        isActive: true,
        createdBy: userId
      });

      // Create staff profile
      const newStaff = await Staff.create({
        user: newUser._id,
        employeeId,
        department,
        designation,
        dateOfJoining: dateOfJoining || new Date(),
        qualification: qualification || {},
        experience: experience || { years: 0 },
        salary: {
          basicSalary: salary.basicSalary,
          allowances: salary.allowances || { houseRent: 0, transport: 0, medical: 0, other: 0 },
          deductions: { tax: 0, providentFund: 0, other: 0 }
        },
        bankDetails: bankDetails || {},
        alternateContact: alternateContact || {},
        emergencyContact: emergencyContact || {},
        status: 'active'
      });

      // Populate the response
      const populatedStaff = await Staff.findById(newStaff._id)
        .populate('user', 'firstName lastName email personalEmail phone gender dateOfBirth address isActive')
        .populate('subjects')
        .populate('classes.class');

      return res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: populatedStaff,
        credentials: credentials
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Staff API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}
