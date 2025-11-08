import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Class from '../../../models/Class';
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

    // Get classes from both sources
    const classIdsFromStaff = staff.classes.map(c => c.class?._id).filter(Boolean);
    const classesAsTeacher = await Class.find({ classTeacher: staff._id });
    const classIdsFromTeacher = classesAsTeacher.map(c => c._id);
    const allClassIds = [...new Set([...classIdsFromStaff, ...classIdsFromTeacher])];

    // Fetch all classes with timetable populated
    const classes = await Class.find({ _id: { $in: allClassIds } })
      .populate({
        path: 'timetable.periods.subject',
        select: 'name code'
      })
      .populate({
        path: 'timetable.periods.teacher',
        select: 'employeeId',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      });

    // Build weekly schedule organized by day
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklySchedule = {};

    // Initialize days
    weekDays.forEach(day => {
      weeklySchedule[day] = [];
    });

    // Process each class's timetable
    classes.forEach(classItem => {
      if (!classItem.timetable || classItem.timetable.length === 0) return;

      classItem.timetable.forEach(daySchedule => {
        const day = daySchedule.day;
        if (!weeklySchedule[day]) return;

        daySchedule.periods.forEach(period => {
          // Only show periods where this staff is the teacher
          if (period.teacher && period.teacher._id.toString() === staff._id.toString()) {
            weeklySchedule[day].push({
              periodNumber: period.periodNumber,
              subject: period.subject?.name || 'N/A',
              subjectCode: period.subject?.code || '',
              startTime: period.startTime || 'N/A',
              endTime: period.endTime || 'N/A',
              className: classItem.name,
              grade: classItem.grade,
              section: classItem.section,
              room: classItem.room || 'N/A',
              classId: classItem._id
            });
          }
        });
      });
    });

    // Sort periods within each day by period number
    Object.keys(weeklySchedule).forEach(day => {
      weeklySchedule[day].sort((a, b) => a.periodNumber - b.periodNumber);
    });

    // Build simple class list
    const classList = classes.map(c => ({
      className: c.name,
      grade: c.grade,
      section: c.section,
      room: c.room || 'N/A',
      subjects: staff.subjects.map(s => s.name).join(', ') || 'N/A'
    }));

    res.json({
      success: true,
      data: {
        staff: {
          name: `${user.firstName} ${user.lastName}`,
          employeeId: staff.employeeId,
          department: staff.department,
          designation: staff.designation
        },
        weeklySchedule,
        classList,
        totalClasses: classList.length
      }
    });

  } catch (error) {
    console.error('Schedule API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule',
      error: error.message
    });
  }
}

