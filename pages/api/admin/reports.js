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

    // Get date range from query params
    const { dateRange = 'month', startDate, endDate } = req.query;
    
    // Validation for custom date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Validate start date before end date
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be before or equal to end date'
        });
      }
      
      // Limit to 1 year range
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        return res.status(400).json({
          success: false,
          message: 'Date range cannot exceed 1 year (365 days)'
        });
      }
    }
    
    // If one date is provided, both must be provided
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Both start date and end date are required for custom date range'
      });
    }
    
    // Calculate date range
    let dateFilter = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      dateFilter = {
        $gte: start,
        $lte: end
      };
    } else {
      const rangeStart = new Date(today);
      switch (dateRange) {
        case 'today':
          rangeStart.setHours(0, 0, 0, 0);
          break;
        case 'week':
          rangeStart.setDate(rangeStart.getDate() - 7);
          break;
        case 'month':
          rangeStart.setMonth(rangeStart.getMonth() - 1);
          break;
        case 'year':
          rangeStart.setFullYear(rangeStart.getFullYear() - 1);
          break;
        default:
          rangeStart.setMonth(rangeStart.getMonth() - 1);
      }
      dateFilter = { $gte: rangeStart };
    }

    // Student Report
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });

    // Attendance Report
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentStudentsToday = await AttendanceStudent.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'present'
    });

    const attendanceRate = totalStudents > 0 
      ? ((presentStudentsToday / totalStudents) * 100).toFixed(1) 
      : 0;

    // Fee Report (with date filtering for paid fees)
    const feePipeline = [
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ];
    
    // Add date filter for paid fees if applicable
    const paidFeePipeline = [
      { 
        $match: { 
          paymentStatus: 'paid',
          ...(Object.keys(dateFilter).length > 0 && { paymentDate: dateFilter })
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ];
    
    const totalFeesCollected = await Fee.aggregate(paidFeePipeline);
    const feesCollected = totalFeesCollected.length > 0 ? totalFeesCollected[0].total : 0;

    const totalFeesPending = await Fee.aggregate([
      { $match: { paymentStatus: { $ne: 'paid' } } },
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

