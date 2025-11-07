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

      // Validation
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Subject name is required' });
      }
      if (!code || !code.trim()) {
        return res.status(400).json({ success: false, message: 'Subject code is required' });
      }

      // Check if code already exists
      const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
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


