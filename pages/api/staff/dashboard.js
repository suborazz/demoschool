import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Class from '../../../models/Class';
import Student from '../../../models/Student';
import Grade from '../../../models/Grade';
import AttendanceStaff from '../../../models/AttendanceStaff';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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
    const staff = await Staff.findOne({ user: userId })
      .populate('classes.class')
      .populate('subjects');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // Get classes from both sources:
    // 1. Staff's classes array
    const classIdsFromStaff = staff.classes.map(c => c.class?._id).filter(Boolean);
    
    // 2. Classes where this staff is assigned as classTeacher
    const classesAsTeacher = await Class.find({ classTeacher: staff._id });
    const classIdsFromTeacher = classesAsTeacher.map(c => c._id);
    
    // Combine and deduplicate
    const allClassIds = [...new Set([...classIdsFromStaff, ...classIdsFromTeacher])];
    
    // Get total students taught by this staff
    const totalStudents = await Student.countDocuments({ 
      class: { $in: allClassIds } 
    });

    // Get pending grades to review
    const pendingGrades = await Grade.countDocuments({
      subject: { $in: staff.subjects.map(s => s._id) },
      status: { $ne: 'published' }
    });

    // Get staff attendance this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const attendanceThisMonth = await AttendanceStaff.find({
      staff: staff._id,
      date: { $gte: startOfMonth }
    });

    const presentDays = attendanceThisMonth.filter(a => a.status === 'present').length;
    const totalDays = attendanceThisMonth.length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : 0;

    // Get today's schedule (from all assigned classes)
    const todayScheduleFromStaff = staff.classes
      .filter(c => c.class)
      .map(c => ({
        className: c.class.name,
        subject: staff.subjects[0]?.name || 'Subject',
        grade: c.class.grade,
        section: c.class.section
      }));
    
    const todayScheduleFromTeacher = classesAsTeacher.map(c => ({
      className: c.name,
      subject: staff.subjects[0]?.name || 'Class Teacher',
      grade: c.grade,
      section: c.section
    }));
    
    // Combine schedules and deduplicate based on className
    const todayScheduleMap = new Map();
    [...todayScheduleFromStaff, ...todayScheduleFromTeacher].forEach(item => {
      todayScheduleMap.set(item.className, item);
    });
    const todaySchedule = Array.from(todayScheduleMap.values());

    res.json({
      success: true,
      data: {
        staff: {
          name: `${user.firstName} ${user.lastName}`,
          employeeId: staff.employeeId,
          department: staff.department,
          designation: staff.designation
        },
        stats: {
          totalClasses: allClassIds.length,
          totalStudents,
          pendingGrades,
          attendanceRate: `${attendanceRate}%`
        },
        todaySchedule,
        summary: {
          classesToday: todaySchedule.length,
          attendanceMarked: 0, // Can be calculated based on today's attendance records
          gradesPending: pendingGrades,
          messages: 0 // Placeholder for future messaging feature
        }
      }
    });

  } catch (error) {
    console.error('Staff Dashboard API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
}

