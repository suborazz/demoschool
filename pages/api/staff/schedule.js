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
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }

    const userId = decoded.id || decoded.userId;
    
    // Verify user exists and is active
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is inactive. Please contact admin.' });
    }
    
    if (user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
    }

    // Find staff profile with populated data
    const staff = await Staff.findOne({ user: userId })
      .populate('classes.class')
      .populate('subjects');

    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff profile not found. Please contact admin to set up your profile.' 
      });
    }

    // Validate staff has required data
    if (!staff.employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Staff profile is incomplete. Employee ID is missing.' 
      });
    }

    // Get classes from both sources
    const classIdsFromStaff = staff.classes && staff.classes.length > 0
      ? staff.classes.map(c => c.class?._id).filter(Boolean)
      : [];
    
    const classesAsTeacher = await Class.find({ classTeacher: staff._id });
    const classIdsFromTeacher = classesAsTeacher.map(c => c._id);
    const allClassIds = [...new Set([...classIdsFromStaff, ...classIdsFromTeacher])];

    // If no classes assigned, return empty schedule
    if (allClassIds.length === 0) {
      return res.json({
        success: true,
        message: 'No classes assigned yet',
        data: {
          staff: {
            name: `${user.firstName} ${user.lastName}`,
            employeeId: staff.employeeId,
            department: staff.department || 'Not Assigned',
            designation: staff.designation || 'Staff'
          },
          weeklySchedule: {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: []
          },
          classList: [],
          totalClasses: 0
        }
      });
    }

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
            // Validate period has required data
            if (!period.periodNumber || !period.startTime || !period.endTime) {
              console.warn(`Incomplete period data for class ${classItem.name}`);
              return;
            }

            weeklySchedule[day].push({
              periodNumber: period.periodNumber,
              subject: period.subject?.name || 'Not Assigned',
              subjectCode: period.subject?.code || '',
              startTime: period.startTime,
              endTime: period.endTime,
              className: classItem.name,
              grade: classItem.grade,
              section: classItem.section,
              room: classItem.room || 'Not Assigned',
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

    // Detect time conflicts
    const conflicts = [];
    Object.keys(weeklySchedule).forEach(day => {
      const periods = weeklySchedule[day];
      for (let i = 0; i < periods.length; i++) {
        for (let j = i + 1; j < periods.length; j++) {
          const p1 = periods[i];
          const p2 = periods[j];
          
          // Check for overlapping times
          if (p1.startTime === p2.startTime || 
              (p1.startTime < p2.startTime && p1.endTime > p2.startTime) ||
              (p2.startTime < p1.startTime && p2.endTime > p1.startTime)) {
            conflicts.push({
              day,
              period1: `${p1.subject} (${p1.className})`,
              period2: `${p2.subject} (${p2.className})`,
              time: `${p1.startTime}-${p1.endTime}`
            });
          }
        }
      }
    });

    // Log conflicts if any
    if (conflicts.length > 0) {
      console.warn('Schedule conflicts detected:', conflicts);
    }

    // Build simple class list with validation
    const classList = classes.map(c => {
      // Get subjects this staff teaches in THIS specific class
      const classSubjectsSet = new Set();
      
      if (c.timetable && c.timetable.length > 0) {
        c.timetable.forEach(daySchedule => {
          daySchedule.periods.forEach(period => {
            // Only add subjects where this staff is the teacher
            if (period.teacher && 
                period.teacher._id.toString() === staff._id.toString() && 
                period.subject && 
                period.subject.name) {
              classSubjectsSet.add(period.subject.name);
            }
          });
        });
      }
      
      const classSubjects = classSubjectsSet.size > 0
        ? Array.from(classSubjectsSet).sort().join(', ')
        : 'Not Assigned';
      
      return {
        className: c.name || 'Unnamed Class',
        grade: c.grade || 'N/A',
        section: c.section || 'N/A',
        room: c.room || 'Not Assigned',
        subjects: classSubjects
      };
    });

    // Calculate statistics
    const totalPeriods = Object.values(weeklySchedule).reduce((sum, day) => sum + day.length, 0);

    return res.json({
      success: true,
      data: {
        staff: {
          name: `${user.firstName} ${user.lastName}`,
          employeeId: staff.employeeId,
          department: staff.department || 'Not Assigned',
          designation: staff.designation || 'Staff'
        },
        weeklySchedule,
        classList,
        totalClasses: classList.length,
        statistics: {
          totalPeriods,
          hasConflicts: conflicts.length > 0,
          conflicts: conflicts.length > 0 ? conflicts : undefined
        }
      }
    });

  } catch (error) {
    console.error('Schedule API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
