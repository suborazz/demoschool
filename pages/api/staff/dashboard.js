import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Class from '../../../models/Class';
import Student from '../../../models/Student';
import Grade from '../../../models/Grade';
import AttendanceStudent from '../../../models/AttendanceStudent';
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

    // Get student attendance marking statistics for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count unique class-date combinations where this staff marked attendance
    const attendanceMarkedThisMonth = await AttendanceStudent.aggregate([
      {
        $match: {
          markedBy: userId,
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: { class: '$class', date: '$date' }
        }
      },
      {
        $count: 'total'
      }
    ]);

    const classesWithAttendance = attendanceMarkedThisMonth[0]?.total || 0;
    
    // Calculate total working days this month (excluding weekends)
    const today = new Date();
    const daysInMonth = today.getDate();
    let workingDays = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(today.getFullYear(), today.getMonth(), i);
      const dayOfWeek = day.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
    }
    
    // Expected attendance marks = number of classes * working days
    const expectedMarks = allClassIds.length * workingDays;
    const attendanceRate = expectedMarks > 0 ? ((classesWithAttendance / expectedMarks) * 100).toFixed(0) : 0;

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

    // Calculate today's attendance marked
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const attendanceMarkedToday = await AttendanceStudent.aggregate([
      {
        $match: {
          markedBy: userId,
          date: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      {
        $group: {
          _id: '$class'
        }
      },
      {
        $count: 'total'
      }
    ]);

    const classesMarkedToday = attendanceMarkedToday[0]?.total || 0;

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
          attendanceMarked: classesMarkedToday,
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

