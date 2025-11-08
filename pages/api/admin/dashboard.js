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

    // Get time range from query parameter
    const { timeRange = 'month' } = req.query;
    
    // Calculate date range based on filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = new Date(today);
    
    switch (timeRange) {
      case 'today':
        // Already set to today
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'month':
      default:
        startDate.setMonth(today.getMonth() - 1);
        break;
    }

    // Fetch real data from database
    const totalStudents = await Student.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const totalParents = await Parent.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    // Get today's attendance (reuse the today variable already defined)
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

    // Get revenue for selected time range
    const revenueForRange = await Fee.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          paymentDate: { $gte: startDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRevenue = revenueForRange.length > 0 ? revenueForRange[0].total : 0;

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

    // Get recent enrollments for the selected time range
    const recentStudents = await Student.countDocuments({
      createdAt: { $gte: startDate }
    });

    const recentStaff = await Staff.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get class occupancy
    const classesWithCounts = await Promise.all(
      (await Class.find().limit(5)).map(async (cls) => {
        const studentCount = await Student.countDocuments({ class: cls._id });
        return {
          name: cls.name,
          grade: cls.grade,
          section: cls.section,
          students: studentCount,
          capacity: cls.capacity,
          occupancy: cls.capacity > 0 ? ((studentCount / cls.capacity) * 100).toFixed(0) : 0
        };
      })
    );

    // Get recent activities for the selected time range
    const recentActivities = [];
    
    // Add recent student enrollments within the time range
    const latestStudents = await Student.find({
      createdAt: { $gte: startDate }
    })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    latestStudents.forEach(student => {
      if (student.user) {
        recentActivities.push({
          type: 'enrollment',
          message: `${student.user.firstName} ${student.user.lastName} enrolled`,
          time: student.createdAt,
          icon: 'student'
        });
      }
    });

    // Add recent staff additions within the time range
    const latestStaff = await Staff.find({
      createdAt: { $gte: startDate }
    })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    latestStaff.forEach(staff => {
      if (staff.user) {
        recentActivities.push({
          type: 'staff',
          message: `${staff.user.firstName} ${staff.user.lastName} joined as ${staff.designation}`,
          time: staff.createdAt,
          icon: 'staff'
        });
      }
    });

    // Sort by time and limit to 10
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = recentActivities.slice(0, 10);

    // Generate range label for display
    const getRangeLabel = () => {
      switch (timeRange) {
        case 'today': return 'Today';
        case 'week': return 'This Week';
        case 'year': return 'This Year';
        case 'month':
        default: return 'This Month';
      }
    };

    res.json({
      success: true,
      data: {
        timeRange: timeRange,
        rangeLabel: getRangeLabel(),
        stats: {
          totalStudents,
          totalStaff,
          totalParents,
          totalClasses,
          totalSubjects,
          revenue: totalRevenue,
          pendingFees: totalPendingFees,
          recentStudents,
          recentStaff
        },
        todaySummary: {
          presentStudents: presentStudentsToday,
          presentStaff: presentStaffToday,
          totalStudents,
          totalStaff
        },
        metrics: {
          attendanceRate: `${attendanceRate}%`,
          feeCollectionRate: `${feeCollectionRate}%`,
          passRate: '0%'
        },
        classOccupancy: classesWithCounts,
        recentActivities: limitedActivities
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
