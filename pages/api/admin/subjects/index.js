import connectDB from '../../../../lib/mongodb';
import Subject from '../../../../models/Subject';
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

    // GET - Fetch all subjects
    if (req.method === 'GET') {
      const subjects = await Subject.find()
        .populate('classes', 'name grade section')
        .sort({ name: 1 });

      return res.status(200).json({
        success: true,
        count: subjects.length,
        data: subjects
      });
    }

    // POST - Create new subject
    if (req.method === 'POST') {
      const {
        name,
        code,
        description,
        category,
        totalMarks,
        passingMarks
      } = req.body;

      // Comprehensive Validation
      const validationErrors = [];

      // Name validation
      if (!name || !name.trim()) {
        validationErrors.push('Subject name is required');
      } else {
        if (name.trim().length < 2) {
          validationErrors.push('Subject name must be at least 2 characters');
        }
        if (name.trim().length > 100) {
          validationErrors.push('Subject name cannot exceed 100 characters');
        }
      }

      // Code validation
      if (!code || !code.trim()) {
        validationErrors.push('Subject code is required');
      } else {
        if (code.trim().length < 2) {
          validationErrors.push('Subject code must be at least 2 characters');
        }
        if (code.trim().length > 20) {
          validationErrors.push('Subject code cannot exceed 20 characters');
        }
        if (!/^[A-Z0-9-_]+$/i.test(code.trim())) {
          validationErrors.push('Subject code can only contain letters, numbers, hyphens, and underscores');
        }
      }

      // Category validation
      if (!category) {
        validationErrors.push('Category is required');
      } else {
        const validCategories = ['Core', 'Elective', 'Language', 'Science', 'Arts', 'Sports', 'Co-curricular'];
        if (!validCategories.includes(category)) {
          validationErrors.push('Invalid category');
        }
      }

      // Total marks validation
      if (!totalMarks) {
        validationErrors.push('Total marks is required');
      } else {
        if (totalMarks <= 0) {
          validationErrors.push('Total marks must be greater than 0');
        }
        if (totalMarks > 1000) {
          validationErrors.push('Total marks cannot exceed 1000');
        }
      }

      // Passing marks validation
      if (passingMarks === undefined || passingMarks === null) {
        validationErrors.push('Passing marks is required');
      } else {
        if (passingMarks < 0) {
          validationErrors.push('Passing marks cannot be negative');
        }
        if (parseInt(passingMarks) > parseInt(totalMarks)) {
          validationErrors.push('Passing marks cannot exceed total marks');
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Check if code already exists
      const existingSubject = await Subject.findOne({ code: code.toUpperCase().trim() });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists. Please use a different code.'
        });
      }

      // Create new subject
      const newSubject = await Subject.create({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description?.trim() || '',
        category: category || 'Core',
        totalMarks: totalMarks || 100,
        passingMarks: passingMarks || 33,
        isActive: true
      });

      return res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: newSubject
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Subjects API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}


