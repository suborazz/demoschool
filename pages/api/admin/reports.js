import connectDB from '../../../lib/mongodb';
import Student from '../../../models/Student';
import Staff from '../../../models/Staff';
import Fee from '../../../models/Fee';
import AttendanceStudent from '../../../models/AttendanceStudent';
import AttendanceStaff from '../../../models/AttendanceStaff';
import Grade from '../../../models/Grade';
import Class from '../../../models/Class';
import User from '../../../models/User';
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

    // Student Report
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });

    // Attendance Report
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentStudentsToday = await AttendanceStudent.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'present'
    });

    const attendanceRate = totalStudents > 0 
      ? ((presentStudentsToday / totalStudents) * 100).toFixed(1) 
      : 0;

    // Fee Report
    const totalFeesCollected = await Fee.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const feesCollected = totalFeesCollected.length > 0 ? totalFeesCollected[0].total : 0;

    const totalFeesPending = await Fee.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPending' } } }
    ]);
    const feesPending = totalFeesPending.length > 0 ? totalFeesPending[0].total : 0;

    // Staff Report
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ status: 'active' });

    // Class Report
    const totalClasses = await Class.countDocuments();

    // Performance Report (if grades exist)
    const totalGrades = await Grade.countDocuments();

    res.json({
      success: true,
      data: {
        studentReport: {
          total: totalStudents,
          active: activeStudents,
          inactive: totalStudents - activeStudents
        },
        attendanceReport: {
          presentToday: presentStudentsToday,
          totalStudents,
          attendanceRate: `${attendanceRate}%`
        },
        feeReport: {
          collected: feesCollected,
          pending: feesPending,
          total: feesCollected + feesPending
        },
        staffReport: {
          total: totalStaff,
          active: activeStaff
        },
        classReport: {
          totalClasses
        },
        performanceReport: {
          totalGrades
        }
      }
    });

  } catch (error) {
    console.error('Reports API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
}

