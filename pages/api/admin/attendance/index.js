import connectDB from '../../../../lib/mongodb';
import AttendanceStudent from '../../../../models/AttendanceStudent';
import Student from '../../../../models/Student';
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
    
    if (!user || !['admin', 'staff'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin or Staff only.' });
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await AttendanceStudent.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate('class');

    // Calculate stats
    const totalStudents = await Student.countDocuments();
    const presentToday = await AttendanceStudent.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'present'
    });
    const absentToday = await AttendanceStudent.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'absent'
    });

    const attendanceRate = totalStudents > 0 
      ? ((presentToday / totalStudents) * 100).toFixed(1) 
      : 0;

    return res.status(200).json({
      success: true,
      data: todayAttendance,
      stats: {
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate: `${attendanceRate}%`
      }
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

