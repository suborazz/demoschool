import connectDB from '../../../../lib/mongodb';
import Class from '../../../../models/Class';
import Student from '../../../../models/Student';
import Staff from '../../../../models/Staff';
import User from '../../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    await connectDB();

    // Verify admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    // GET - Fetch all classes
    if (req.method === 'GET') {
      const classes = await Class.find()
        .populate('classTeacher', 'firstName lastName')
        .sort({ grade: 1, name: 1 });

      // Get student count for each class
      const classesWithCounts = await Promise.all(
        classes.map(async (cls) => {
          const studentCount = await Student.countDocuments({ class: cls._id });
          return {
            ...cls.toObject(),
            studentCount
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: classesWithCounts.length,
        data: classesWithCounts
      });
    }

    // POST - Create new class
    if (req.method === 'POST') {
      const {
        name,
        grade,
        section,
        academicYear,
        capacity,
        classTeacher,
        room
      } = req.body;

      // Comprehensive validation
      const validationErrors = [];

      // Required fields
      if (!name || !name.trim()) {
        validationErrors.push('Class name is required');
      }
      if (!grade) {
        validationErrors.push('Grade is required');
      }

      // Grade validation
      if (grade && (grade < 1 || grade > 12)) {
        validationErrors.push('Grade must be between 1 and 12');
      }

      // Capacity validation
      if (capacity && capacity < 1) {
        validationErrors.push('Capacity must be at least 1');
      }

      // Name length validation
      if (name && name.trim().length < 2) {
        validationErrors.push('Class name must be at least 2 characters');
      }

      // Academic year validation
      const currentYear = new Date().getFullYear();
      if (academicYear && academicYear !== currentYear.toString() && academicYear !== (currentYear + 1).toString() && academicYear !== (currentYear - 1).toString()) {
        validationErrors.push('Academic year must be current year, previous year, or next year');
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Check if class with same name already exists
      const existingClass = await Class.findOne({ name: name.trim(), academicYear });
      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: 'A class with this name already exists for this academic year'
        });
      }

      // Log data before creating
      console.log('Creating class with data:', {
        name,
        grade,
        section: section || 'A',
        academicYear: academicYear || new Date().getFullYear().toString(),
        capacity: capacity || 40,
        room: room || '',
        classTeacher: classTeacher || null
      });

      // Create new class
      const newClass = await Class.create({
        name: name.trim(),
        grade: parseInt(grade),
        section: section || 'A',
        academicYear: academicYear || new Date().getFullYear().toString(),
        capacity: parseInt(capacity) || 40,
        classTeacher: classTeacher || null,
        room: room ? room.trim() : '',
        isActive: true
      });

      console.log('Class created successfully:', newClass);

      const populatedClass = await Class.findById(newClass._id)
        .populate('classTeacher', 'firstName lastName');

      return res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: populatedClass
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Classes API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

