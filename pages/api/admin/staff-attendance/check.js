import connectDB from '../../../../lib/mongodb';
import AttendanceStaff from '../../../../models/AttendanceStaff';
import User from '../../../../models/User';
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

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date is required' 
      });
    }

    // Check if attendance already marked
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await AttendanceStaff.findOne({
      date: attendanceDate
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        message: 'Staff attendance already marked for this date',
        date: attendanceDate
      });
    }

    return res.status(200).json({
      success: true,
      alreadyMarked: false,
      message: 'Staff attendance not yet marked'
    });

  } catch (error) {
    console.error('Check Staff Attendance API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

