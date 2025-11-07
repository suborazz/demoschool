import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Class from '../../../models/Class';
import Student from '../../../models/Student';
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
      .populate('classes.class');

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

    // Fetch students from these classes only
    const students = await Student.find({ 
      class: { $in: allClassIds } 
    })
      .populate('user', 'firstName lastName email phone gender dateOfBirth address isActive')
      .populate('class', 'name grade section academicYear')
      .populate({
        path: 'parents',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .sort({ rollNumber: 1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    console.error('Staff Students API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

