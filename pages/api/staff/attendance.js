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
      const { classId, className, date, attendanceRecords } = req.body;

      // Validation
      if (!classId) {
        return res.status(400).json({ success: false, message: 'Class ID is required' });
      }
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }
      if (!attendanceRecords || attendanceRecords.length === 0) {
        return res.status(400).json({ success: false, message: 'Attendance records are required' });
      }

      // Validate date is not in future
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (attendanceDate > today) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot mark attendance for future dates' 
        });
      }

      // Validate date is not older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      if (attendanceDate < sevenDaysAgo) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot mark attendance for dates older than 7 days. Please contact admin for backdated attendance.' 
        });
      }

      // Validate attendance records
      const validStatuses = ['present', 'absent', 'late'];
      for (const record of attendanceRecords) {
        if (!record.studentId) {
          return res.status(400).json({ 
            success: false, 
            message: 'Each attendance record must have a student ID' 
          });
        }
        if (!record.status || !validStatuses.includes(record.status)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid attendance status. Must be present, absent, or late' 
          });
        }
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

      // Check if attendance already marked for this class and date
      const existing = await AttendanceStudent.findOne({
        class: classId,
        date: attendanceDate
      });

      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: `Attendance already marked for this class on ${new Date(date).toLocaleDateString()}. Please choose a different date or contact admin to update existing records.` 
        });
      }

      // Verify all students belong to the class
      const studentIds = attendanceRecords.map(r => r.studentId);
      const studentsInClass = await Student.find({ 
        _id: { $in: studentIds },
        class: classId 
      });

      if (studentsInClass.length !== studentIds.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'Some students do not belong to the selected class' 
        });
      }

      // Create attendance records
      const attendancePromises = attendanceRecords.map(record => 
        AttendanceStudent.create({
          student: record.studentId,
          class: classId,
          date: attendanceDate,
          status: record.status,
          remarks: record.remarks || '',
          markedBy: userId
        })
      );

      await Promise.all(attendancePromises);

      // Count statistics
      const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
      const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
      const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;

      return res.status(201).json({
        success: true,
        message: `Attendance marked successfully for ${attendanceRecords.length} students`,
        data: {
          total: attendanceRecords.length,
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          date: attendanceDate,
          class: className || classId
        }
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
