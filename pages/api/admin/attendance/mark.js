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
    const user = await User.findById(userId);
    
    // Only staff/teachers can mark attendance, NOT admin
    if (!user || user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only teachers/staff can mark attendance. Admins have view-only access.' 
      });
    }

    const { classId, date, attendanceRecords } = req.body;

    // Comprehensive Validation
    const validationErrors = [];

    if (!classId) {
      validationErrors.push('Class is required');
    }

    if (!date) {
      validationErrors.push('Date is required');
    }

    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      validationErrors.push('Attendance records are required');
    }

    // Validate date is not in future
    if (date) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const selectedDate = new Date(date);
      
      if (selectedDate > today) {
        validationErrors.push('Cannot mark attendance for future dates');
      }
    }

    // Validate each attendance record
    const validStatuses = ['present', 'absent', 'late', 'half-day', 'on-leave'];
    if (attendanceRecords && Array.isArray(attendanceRecords)) {
      attendanceRecords.forEach((record, index) => {
        if (!record.studentId) {
          validationErrors.push(`Record ${index + 1}: Student ID is required`);
        }
        if (!record.status) {
          validationErrors.push(`Record ${index + 1}: Status is required`);
        }
        if (record.status && !validStatuses.includes(record.status)) {
          validationErrors.push(`Record ${index + 1}: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join('. ')
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

