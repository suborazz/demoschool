import connectDB from '../../../lib/mongodb';
import Student from '../../../models/Student';
import AttendanceStudent from '../../../models/AttendanceStudent';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

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
      return res.status(403).json({ success: false, message: 'Access denied. Student only.' });
    }

    // Find student profile
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get attendance records
    const attendance = await AttendanceStudent.find({ student: student._id })
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 })
      .limit(30); // Last 30 days

    // Calculate statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const attendanceRate = totalDays > 0 
      ? ((presentDays / totalDays) * 100).toFixed(1) 
      : 0;

    // Get this month's attendance
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthAttendance = await AttendanceStudent.countDocuments({
      student: student._id,
      date: { $gte: startOfMonth }
    });

    const thisMonthPresent = await AttendanceStudent.countDocuments({
      student: student._id,
      date: { $gte: startOfMonth },
      status: 'present'
    });

    const thisMonthRate = thisMonthAttendance > 0
      ? ((thisMonthPresent / thisMonthAttendance) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        attendance,
        stats: {
          totalDays,
          presentDays,
          absentDays,
          attendanceRate: `${attendanceRate}%`,
          thisMonthRate: `${thisMonthRate}%`
        }
      }
    });

  } catch (error) {
    console.error('Student Attendance API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
}

