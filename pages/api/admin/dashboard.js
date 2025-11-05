import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Staff from '../../../models/Staff';
import Student from '../../../models/Student';
import Parent from '../../../models/Parent';
import Fee from '../../../models/Fee';
import AttendanceStudent from '../../../models/AttendanceStudent';
import AttendanceStaff from '../../../models/AttendanceStaff';
import Class from '../../../models/Class';
import Subject from '../../../models/Subject';
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
    const adminUser = await User.findById(userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    // Fetch real data from database
    const totalStudents = await Student.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const totalParents = await Parent.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentStudentsToday = await AttendanceStudent.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'present'
    });

    const presentStaffToday = await AttendanceStaff.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'present'
    });

    // Get pending fees
    const pendingFees = await Fee.aggregate([
      { $match: { paymentStatus: { $ne: 'paid' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPendingFees = pendingFees.length > 0 ? pendingFees[0].total : 0;

    // Get this month's revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = await Fee.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          paymentDate: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalMonthlyRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

    // Calculate attendance rate
    const attendanceRate = totalStudents > 0 
      ? ((presentStudentsToday / totalStudents) * 100).toFixed(1) 
      : 0;

    // Calculate fee collection rate (paid vs total)
    const totalFees = await Fee.countDocuments();
    const paidFees = await Fee.countDocuments({ paymentStatus: 'paid' });
    const feeCollectionRate = totalFees > 0 
      ? ((paidFees / totalFees) * 100).toFixed(0)
      : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalStaff,
          totalParents,
          totalClasses,
          totalSubjects,
          monthlyRevenue: totalMonthlyRevenue,
          pendingFees: totalPendingFees
        },
        todaySummary: {
          presentStudents: presentStudentsToday,
          presentStaff: presentStaffToday
        },
        metrics: {
          attendanceRate: `${attendanceRate}%`,
          feeCollectionRate: `${feeCollectionRate}%`,
          passRate: '0%' // Calculate this based on your grades logic
        }
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
}
