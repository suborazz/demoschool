import connectDB from '../../../lib/mongodb';
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

    // Verify student authentication
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
    
    if (!user || user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access denied. Students only.' });
    }

    // Find the student and their class
    const student = await Student.findOne({ user: userId }).select('class');
    if (!student || !student.class) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student record or class not found' 
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
    console.error('Student Timetable API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

