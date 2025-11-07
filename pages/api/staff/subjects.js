import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Subject from '../../../models/Subject';
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
      .populate('subjects');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // Return staff's assigned subjects
    // If no subjects assigned, return all active subjects (for class teachers)
    let subjects = staff.subjects || [];
    
    if (subjects.length === 0) {
      // If staff has no subjects, return all active subjects
      // (useful for class teachers who need to add grades for any subject)
      subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
    }

    return res.status(200).json({
      success: true,
      count: subjects.length,
      subjects
    });

  } catch (error) {
    console.error('Staff Subjects API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}


