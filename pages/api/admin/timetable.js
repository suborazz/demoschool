import connectDB from '../../../lib/mongodb';
import Class from '../../../models/Class';
import Staff from '../../../models/Staff';
import Subject from '../../../models/Subject';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
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

    // GET - Fetch timetable for a specific class
    if (req.method === 'GET') {
      const { classId } = req.query;

      if (!classId) {
        return res.status(400).json({ success: false, message: 'Class ID is required' });
      }

      const classData = await Class.findById(classId)
        .populate({
          path: 'timetable.periods.subject',
          select: 'name code'
        })
        .populate({
          path: 'timetable.periods.teacher',
          select: 'employeeId designation',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        })
        .populate('subjects');

      if (!classData) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      // Get all available staff and subjects
      const allStaff = await Staff.find()
        .populate('user', 'firstName lastName')
        .populate('subjects');
      
      const allSubjects = await Subject.find();

      return res.json({
        success: true,
        data: {
          class: classData,
          availableStaff: allStaff,
          availableSubjects: allSubjects
        }
      });
    }

    // PUT - Update timetable for a class
    if (req.method === 'PUT') {
      const { classId, timetable } = req.body;

      if (!classId) {
        return res.status(400).json({ success: false, message: 'Class ID is required' });
      }

      if (!timetable || !Array.isArray(timetable)) {
        return res.status(400).json({ success: false, message: 'Valid timetable data is required' });
      }

      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      // Validate timetable structure
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (const daySchedule of timetable) {
        if (!validDays.includes(daySchedule.day)) {
          return res.status(400).json({ 
            success: false, 
            message: `Invalid day: ${daySchedule.day}` 
          });
        }

        if (!Array.isArray(daySchedule.periods)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Periods must be an array' 
          });
        }

        // Validate each period
        for (const period of daySchedule.periods) {
          if (!period.periodNumber || !period.subject || !period.teacher) {
            return res.status(400).json({ 
              success: false, 
              message: 'Each period must have periodNumber, subject, and teacher' 
            });
          }

          // Validate times if provided
          if (period.startTime && period.endTime) {
            if (period.endTime <= period.startTime) {
              return res.status(400).json({ 
                success: false, 
                message: `${daySchedule.day} Period ${period.periodNumber}: End time must be after start time` 
              });
            }
          }

          // If one time is provided, both must be provided
          if ((period.startTime && !period.endTime) || (!period.startTime && period.endTime)) {
            return res.status(400).json({ 
              success: false, 
              message: `${daySchedule.day} Period ${period.periodNumber}: Both start time and end time must be provided` 
            });
          }
        }

        // Check for time overlaps on the same day
        const periodsWithTime = daySchedule.periods.filter(p => p.startTime && p.endTime);
        for (let i = 0; i < periodsWithTime.length; i++) {
          for (let j = i + 1; j < periodsWithTime.length; j++) {
            const p1 = periodsWithTime[i];
            const p2 = periodsWithTime[j];
            
            if (p1.startTime < p2.endTime && p1.endTime > p2.startTime) {
              return res.status(400).json({ 
                success: false, 
                message: `${daySchedule.day}: Period ${p1.periodNumber} and Period ${p2.periodNumber} have overlapping times` 
              });
            }
          }
        }
      }

      // Update timetable
      classData.timetable = timetable;
      await classData.save();

      const updatedClass = await Class.findById(classId)
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

      return res.json({
        success: true,
        message: 'Timetable updated successfully',
        data: updatedClass
      });
    }

    // DELETE - Clear timetable for a class
    if (req.method === 'DELETE') {
      const { classId } = req.query;

      if (!classId) {
        return res.status(400).json({ success: false, message: 'Class ID is required' });
      }

      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      classData.timetable = [];
      await classData.save();

      return res.json({
        success: true,
        message: 'Timetable cleared successfully'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Timetable API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

