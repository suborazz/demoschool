import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Class from '../../../models/Class';
import AttendanceStudent from '../../../models/AttendanceStudent';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Verify staff authentication
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
    
    if (!user || user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
    }

    // Find staff profile
    const staff = await Staff.findOne({ user: userId }).populate('classes.class');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    const { date, className } = req.query;

    if (!date || !className) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and className are required' 
      });
    }

    // Find the class by name from staff's classes
    const staffClass = staff.classes.find(c => c.class?.name === className);
    if (!staffClass) {
      // Try to find it as class teacher
      const classAsTeacher = await Class.findOne({ 
        name: className, 
        classTeacher: staff._id 
      });
      
      if (!classAsTeacher) {
        return res.status(200).json({
          success: true,
          alreadyMarked: false,
          message: 'Class not found in your assignments'
        });
      }
    }

    const classId = staffClass?.class?._id || (await Class.findOne({ 
      name: className, 
      classTeacher: staff._id 
    }))?._id;

    if (!classId) {
      return res.status(200).json({
        success: true,
        alreadyMarked: false,
        message: 'Class not found'
      });
    }

    // Check if attendance already marked
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await AttendanceStudent.findOne({
      class: classId,
      date: attendanceDate
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        message: 'Attendance already marked for this date and class',
        date: attendanceDate,
        className: className
      });
    }

    return res.status(200).json({
      success: true,
      alreadyMarked: false,
      message: 'Attendance not yet marked'
    });

  } catch (error) {
    console.error('Check Attendance API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

