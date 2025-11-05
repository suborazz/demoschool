import connectDB from '../../../../lib/mongodb';
import AttendanceStudent from '../../../../models/AttendanceStudent';
import Student from '../../../../models/Student';
import Class from '../../../../models/Class';
import User from '../../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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
    const adminUser = await User.findById(userId);
    
    if (!adminUser || !['admin', 'staff'].includes(adminUser.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin or Staff only.' });
    }

    const { classId, date, attendanceRecords } = req.body;

    // Validation
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'Class is required'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance records are required'
      });
    }

    // Check if class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already marked for this class and date
    const existingAttendance = await AttendanceStudent.findOne({
      class: classId,
      date: attendanceDate
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this class on this date'
      });
    }

    // Create attendance records
    const attendancePromises = attendanceRecords.map(record => 
      AttendanceStudent.create({
        student: record.studentId,
        class: classId,
        date: attendanceDate,
        status: record.status,
        markedBy: userId,
        remarks: record.remarks || ''
      })
    );

    await Promise.all(attendancePromises);

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      count: attendanceRecords.length
    });

  } catch (error) {
    console.error('Attendance API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

