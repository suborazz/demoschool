import connectDB from '../../../lib/mongodb';
import LMSContent from '../../../models/LMSContent';
import Student from '../../../models/Student';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Verify student authentication
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
    
    if (!user || user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access denied. Students only.' });
    }

    // Find student profile
    const student = await Student.findOne({ user: userId })
      .populate('class');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (!student.class) {
      return res.status(400).json({ success: false, message: 'You are not enrolled in any class' });
    }

    // Fetch content ONLY for student's class (class-wise filtering)
    const contents = await LMSContent.find({
      classId: student.class.name,  // Only content for this class
      isActive: true
    })
      .populate('uploadedBy')
      .sort({ publishDate: -1 });

    // Track access
    const contentsWithAccess = contents.map(content => {
      const studentAccess = content.studentAccess.find(
        sa => sa.student?.toString() === student._id.toString()
      );
      
      return {
        ...content.toObject(),
        hasAccessed: !!studentAccess,
        accessedAt: studentAccess?.accessedAt,
        completed: studentAccess?.completed || false
      };
    });

    return res.status(200).json({
      success: true,
      count: contentsWithAccess.length,
      data: contentsWithAccess,
      studentClass: student.class.name,
      message: `Showing content for ${student.class.name} only`
    });

  } catch (error) {
    console.error('Student LMS Content API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

