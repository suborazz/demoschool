import connectDB from '../../../lib/mongodb';
import Parent from '../../../models/Parent';
import Student from '../../../models/Student';
import Class from '../../../models/Class';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Verify parent authentication
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
    
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Access denied. Parents only.' });
    }

    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    // Verify that the student belongs to this parent
    const parent = await Parent.findOne({ user: userId });
    if (!parent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parent record not found' 
      });
    }

    const student = await Student.findById(studentId).select('class parent');
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Check if this student belongs to this parent
    if (student.parent.toString() !== parent._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view your own children\'s timetable' 
      });
    }

    if (!student.class) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student class not found' 
      });
    }

    // Fetch the class with timetable
    const classData = await Class.findById(student.class)
      .populate({
        path: 'timetable.periods.subject',
        select: 'name code'
      })
      .populate({
        path: 'timetable.periods.teacher',
        select: 'employeeId designation',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .select('name grade section timetable');

    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    return res.json({
      success: true,
      data: classData
    });

  } catch (error) {
    console.error('Parent Timetable API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

