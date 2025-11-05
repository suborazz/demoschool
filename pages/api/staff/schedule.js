import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
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

    // Build schedule from assigned classes and subjects
    const schedule = staff.classes.map(c => ({
      className: c.class?.name || 'N/A',
      grade: c.class?.grade || 'N/A',
      section: c.class?.section || 'N/A',
      room: c.class?.room || 'N/A',
      subjects: staff.subjects.map(s => s.name).join(', ') || 'N/A'
    }));

    res.json({
      success: true,
      data: {
        staff: {
          name: `${user.firstName} ${user.lastName}`,
          employeeId: staff.employeeId,
          department: staff.department
        },
        schedule
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

