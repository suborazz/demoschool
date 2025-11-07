import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Class from '../../../models/Class';
import Student from '../../../models/Student';
import AttendanceStudent from '../../../models/AttendanceStudent';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
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

    // POST - Mark attendance
    if (req.method === 'POST') {
      const { classId, date, attendanceRecords } = req.body;

      // Validation
      if (!classId) {
        return res.status(400).json({ success: false, message: 'Class is required' });
      }
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }
      if (!attendanceRecords || attendanceRecords.length === 0) {
        return res.status(400).json({ success: false, message: 'Attendance records are required' });
      }

      // Check if staff teaches this class (from both sources)
      const teachesClassFromStaff = staff.classes.some(c => c.class?._id?.toString() === classId);
      const classAsTeacher = await Class.findOne({ _id: classId, classTeacher: staff._id });
      
      if (!teachesClassFromStaff && !classAsTeacher) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not assigned to this class. Please contact admin to assign you to this class.' 
        });
      }

      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Check if attendance already marked
      const existing = await AttendanceStudent.findOne({
        class: classId,
        date: attendanceDate
      });

      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: `Attendance already marked for this class on ${new Date(date).toLocaleDateString()}. Please choose a different date.` 
        });
      }

      // Create attendance records
      const attendancePromises = attendanceRecords.map(record => 
        AttendanceStudent.create({
          student: record.studentId,
          class: classId,
          date: attendanceDate,
          status: record.status,
          markedBy: userId
        })
      );

      await Promise.all(attendancePromises);

      return res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        count: attendanceRecords.length
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Staff Attendance API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

