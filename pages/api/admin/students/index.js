import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Student from '../../../../models/Student';
import Parent from '../../../../models/Parent';
import Class from '../../../../models/Class';
import { verify } from 'jsonwebtoken';

/**
 * STUDENT MANAGEMENT API - UNIQUENESS STRATEGY
 * 
 * This API handles multiple students with the same name correctly.
 * 
 * WHAT IS UNIQUE:
 * - Admission Number (auto-generated, globally unique) - e.g., ADM20240001
 * - Email addresses (student, father, mother) - must be unique across all users
 * - Roll Number (unique per class/section/year combination)
 * 
 * WHAT CAN BE DUPLICATE:
 * - Student names (firstName, lastName) - Multiple "John Smith" students allowed
 * - Parent names - Multiple "Robert Johnson" fathers or "Mary Johnson" mothers allowed
 * - Phone numbers - Can be same (though not recommended)
 * - Addresses - Can be same (e.g., siblings)
 * 
 * EXAMPLES THAT WORK:
 * 1. Two students both named "Rahul Kumar" in Class 10-A (different emails, roll numbers)
 * 2. Two students both having fathers named "Rajesh Kumar" (different emails)
 * 3. Siblings in same class with same address and parent names (different emails)
 * 
 * The system uses admission numbers and emails as primary unique identifiers.
 */

// Helper function to generate random password
function generatePassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Helper function to generate Admission Number
async function generateAdmissionNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = 'ADM';
  
  // Find the last admission number for the current year
  const lastStudent = await Student.findOne({
    admissionNumber: new RegExp(`^${prefix}${currentYear}`)
  }).sort({ createdAt: -1 });

  if (lastStudent) {
    // Extract the sequence number and increment
    const lastSequence = parseInt(lastStudent.admissionNumber.slice(-4));
    const newSequence = (lastSequence + 1).toString().padStart(4, '0');
    return `${prefix}${currentYear}${newSequence}`;
  } else {
    // First student of the year
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

    // GET - Fetch all students
    if (req.method === 'GET') {
      const students = await Student.find()
        .populate('user', 'firstName lastName email phone gender dateOfBirth address isActive')
        .populate('class', 'name grade sections academicYear')
        .populate({
          path: 'parents',
          populate: {
            path: 'user',
            select: 'firstName lastName email phone'
          }
        })
        .sort({ createdAt: -1 });

      console.log('Fetched students count:', students.length);

      return res.status(200).json({
        success: true,
        count: students.length,
        students
      });
    }

    // POST - Create new student with parents
    if (req.method === 'POST') {
      const {
        // User fields
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        gender,
        address,
        // Student fields - admissionNumber will be auto-generated
        rollNumber,
        classId,
        section,
        academicYear,
        dateOfAdmission,
        previousSchool,
        bloodGroup,
        emergencyContact,
        medicalInfo,
        // Parent fields
        father,
        mother
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !phone || !dateOfBirth || !gender) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required personal information (First Name, Last Name, Email, Password, Phone, Date of Birth, Gender)'
        });
      }

      if (!rollNumber || !classId || !section || !academicYear) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required academic information (Roll Number, Class, Section, Academic Year)'
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

      // Validate phone number (basic validation)
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number (minimum 10 digits)'
        });
      }

      // IMPORTANT: We only check unique identifiers, NOT names
      // Multiple students can have the same name (including parents)
      // Uniqueness is based on: email, admission number, and roll number per class/section
      
      // Check if email already exists (emails must be unique)
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered. Please use a different email address.'
        });
      }

      // Check if roll number already exists in the same class/section/year
      // Note: Same roll number is allowed in different classes/sections
      const existingRollNumber = await Student.findOne({ 
        rollNumber, 
        class: classId, 
        section,
        academicYear 
      });
      if (existingRollNumber) {
        return res.status(400).json({
          success: false,
          message: 'This roll number already exists in the selected class and section for this academic year'
        });
      }

      // Generate Admission Number automatically
      const admissionNumber = await generateAdmissionNumber();

      // Check if class exists
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid class selected'
        });
      }

      // Store generated credentials
      const credentials = {
        student: {
          email: email.toLowerCase(),
          password: password
        }
      };

      // Create user account for student
      const newUser = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        dateOfBirth,
        gender,
        address: address || {},
        role: 'student',
        isActive: true,
        createdBy: userId
      });

      // Create student profile
      const newStudent = await Student.create({
        user: newUser._id,
        admissionNumber,
        rollNumber,
        class: classId,
        section,
        academicYear,
        dateOfAdmission: dateOfAdmission || new Date(),
        previousSchool: previousSchool || {},
        bloodGroup: bloodGroup || null,
        emergencyContact: emergencyContact || {},
        medicalInfo: medicalInfo || {},
        status: 'active',
        parents: []
      });

      // Create parent accounts if provided
      const parentIds = [];

      // Create father account
      if (father && father.firstName && father.email) {
        // Validate father's email
        if (!emailRegex.test(father.email)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address for father'
          });
        }

        // IMPORTANT: Multiple fathers can have the same name, but emails must be unique
        // This allows different students to have fathers with the same name
        // Check if father email already exists (emails must be unique)
        const existingFatherUser = await User.findOne({ email: father.email.toLowerCase() });
        
        if (existingFatherUser) {
          return res.status(400).json({
            success: false,
            message: 'Father\'s email is already registered. Please use a different email address.'
          });
        }

        const fatherPassword = generatePassword();
        
        const fatherUser = await User.create({
          firstName: father.firstName,
          lastName: father.lastName || lastName,
          email: father.email.toLowerCase(),
          password: fatherPassword,
          phone: father.phone || '',
          dateOfBirth: null,
          gender: 'male',
          address: address || {},
          role: 'parent',
          isActive: true,
          createdBy: userId
        });

        const fatherParent = await Parent.create({
          user: fatherUser._id,
          relationship: 'father',
          occupation: father.occupation || '',
          workDetails: father.workDetails || {},
          children: [newStudent._id]
        });

        parentIds.push(fatherParent._id);

        credentials.father = {
          email: father.email.toLowerCase(),
          password: fatherPassword
        };
      }

      // Create mother account
      if (mother && mother.firstName && mother.email) {
        // Validate mother's email
        if (!emailRegex.test(mother.email)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address for mother'
          });
        }

        // IMPORTANT: Multiple mothers can have the same name, but emails must be unique
        // This allows different students to have mothers with the same name
        // Check if mother email already exists (emails must be unique)
        const existingMotherUser = await User.findOne({ email: mother.email.toLowerCase() });
        
        if (existingMotherUser) {
          return res.status(400).json({
            success: false,
            message: 'Mother\'s email is already registered. Please use a different email address.'
          });
        }

        const motherPassword = generatePassword();
        
        const motherUser = await User.create({
          firstName: mother.firstName,
          lastName: mother.lastName || lastName,
          email: mother.email.toLowerCase(),
          password: motherPassword,
          phone: mother.phone || '',
          dateOfBirth: null,
          gender: 'female',
          address: address || {},
          role: 'parent',
          isActive: true,
          createdBy: userId
        });

        const motherParent = await Parent.create({
          user: motherUser._id,
          relationship: 'mother',
          occupation: mother.occupation || '',
          workDetails: mother.workDetails || {},
          children: [newStudent._id]
        });

        parentIds.push(motherParent._id);

        credentials.mother = {
          email: mother.email.toLowerCase(),
          password: motherPassword
        };
      }

      // Update student with parent IDs
      if (parentIds.length > 0) {
        await Student.findByIdAndUpdate(newStudent._id, {
          parents: parentIds
        });
      }

      // Populate the response
      const populatedStudent = await Student.findById(newStudent._id)
        .populate('user', 'firstName lastName email phone gender dateOfBirth address isActive')
        .populate('class', 'name grade sections academicYear')
        .populate({
          path: 'parents',
          populate: {
            path: 'user',
            select: 'firstName lastName email phone'
          }
        });

      return res.status(201).json({
        success: true,
        message: `Student and parent accounts created successfully! Admission Number: ${admissionNumber}`,
        student: populatedStudent,
        credentials: credentials
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Students API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}
