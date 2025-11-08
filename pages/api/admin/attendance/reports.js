import connectDB from '../../../../lib/mongodb';
import AttendanceStudent from '../../../../models/AttendanceStudent';
import Student from '../../../../models/Student';
import Class from '../../../../models/Class';
import User from '../../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { date, startDate, endDate, classId } = req.query;

    // Build date query
    let dateQuery = {};
    
    if (startDate && endDate) {
      // Date range query
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Validate date range
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be before or equal to end date'
        });
      }

      // Limit to 90 days
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (daysDiff > 90) {
        return res.status(400).json({
          success: false,
          message: 'Date range cannot exceed 90 days'
        });
      }

      dateQuery = { $gte: start, $lte: end };
    } else if (date) {
      // Single date query
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      dateQuery = { $gte: targetDate, $lt: nextDay };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateQuery = { $gte: today, $lt: tomorrow };
    }

    // Build query
    const query = { date: dateQuery };

    if (classId && classId !== 'all') {
      query.class = classId;
    }

    // Fetch attendance records
    const attendanceRecords = await AttendanceStudent.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate('class', 'name grade section')
      .populate('markedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate stats
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const halfDayCount = attendanceRecords.filter(r => r.status === 'half-day').length;
    const onLeaveCount = attendanceRecords.filter(r => r.status === 'on-leave').length;

    const attendanceRate = totalRecords > 0 
      ? ((presentCount / totalRecords) * 100).toFixed(1) 
      : 0;

    // Prepare response stats
    const stats = {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      halfDayCount,
      onLeaveCount,
      attendanceRate: `${attendanceRate}%`
    };

    // Add date info based on query type
    if (startDate && endDate) {
      stats.dateRange = {
        start: new Date(startDate).toISOString().split('T')[0],
        end: new Date(endDate).toISOString().split('T')[0]
      };
    } else if (date) {
      stats.date = new Date(date).toISOString().split('T')[0];
    } else {
      stats.date = new Date().toISOString().split('T')[0];
    }

    return res.status(200).json({
      success: true,
      data: attendanceRecords,
      stats
    });

  } catch (error) {
    console.error('Attendance Reports API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

