import connectDB from '../../../../lib/mongodb';
import Staff from '../../../../models/Staff';
import AttendanceStaff from '../../../../models/AttendanceStaff';
import User from '../../../../models/User';
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

    // POST - Mark attendance
    if (req.method === 'POST') {
      const { date, attendanceRecords } = req.body;

      // Validation
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }
      if (!attendanceRecords || attendanceRecords.length === 0) {
        return res.status(400).json({ success: false, message: 'Attendance records are required' });
      }

      // Validate date is not in future
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (attendanceDate > today) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot mark attendance for future dates' 
        });
      }

      // Validate date is not older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      if (attendanceDate < sevenDaysAgo) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot mark attendance for dates older than 7 days' 
        });
      }

      // Validate attendance records
      const validStatuses = ['present', 'absent', 'late', 'on_leave', 'half_day'];
      for (const record of attendanceRecords) {
        if (!record.staffId) {
          return res.status(400).json({ 
            success: false, 
            message: 'Each attendance record must have a staff ID' 
          });
        }
        if (!record.status || !validStatuses.includes(record.status)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid attendance status. Must be present, absent, late, on_leave, or half_day' 
          });
        }

        // Validate staff exists
        const staffExists = await Staff.findById(record.staffId);
        if (!staffExists) {
          return res.status(404).json({ 
            success: false, 
            message: `Staff member with ID ${record.staffId} not found` 
          });
        }
      }

      // Check if attendance already marked for this date
      const existingCount = await AttendanceStaff.countDocuments({
        date: attendanceDate
      });

      if (existingCount > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Staff attendance already marked for ${new Date(date).toLocaleDateString()}. Please choose a different date or contact system administrator.` 
        });
      }

      // Create attendance records
      const attendancePromises = attendanceRecords.map(record => {
        const checkInDateTime = new Date(date);
        const checkOutDateTime = new Date(date);
        
        // Set times if provided
        if (record.checkInTime) {
          const [hours, minutes] = record.checkInTime.split(':');
          checkInDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        if (record.checkOutTime) {
          const [hours, minutes] = record.checkOutTime.split(':');
          checkOutDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        return AttendanceStaff.create({
          staff: record.staffId,
          date: attendanceDate,
          checkIn: {
            time: checkInDateTime,
            photo: 'manual-entry' // Placeholder for manual admin entry
          },
          checkOut: record.status === 'present' && record.checkOutTime ? {
            time: checkOutDateTime
          } : undefined,
          status: record.status,
          remarks: record.remarks || ''
        });
      });

      await Promise.all(attendancePromises);

      // Count statistics
      const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
      const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
      const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
      const onLeaveCount = attendanceRecords.filter(r => r.status === 'on_leave').length;

      return res.status(201).json({
        success: true,
        message: `Staff attendance marked successfully for ${attendanceRecords.length} staff members`,
        data: {
          total: attendanceRecords.length,
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          onLeave: onLeaveCount,
          date: attendanceDate
        }
      });
    }

    // GET - Fetch attendance records
    if (req.method === 'GET') {
      const { date, startDate, endDate } = req.query;

      let query = {};

      if (date) {
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.date = { $gte: queryDate, $lt: nextDay };
      } else if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        query.date = { $gte: start, $lte: end };
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query.date = { $gte: thirtyDaysAgo };
      }

      const attendanceRecords = await AttendanceStaff.find(query)
        .populate({
          path: 'staff',
          populate: { path: 'user', select: 'firstName lastName email' }
        })
        .sort({ date: -1, 'checkIn.time': 1 });

      return res.status(200).json({
        success: true,
        count: attendanceRecords.length,
        data: attendanceRecords
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Staff Attendance API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

