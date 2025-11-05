import connectDB from '../../../lib/mongodb';
import Student from '../../../models/Student';
import Grade from '../../../models/Grade';
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
      return res.status(403).json({ success: false, message: 'Access denied. Student only.' });
    }

    // Find student profile
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get all grades
    const grades = await Grade.find({ student: student._id })
      .populate('subject')
      .populate('class')
      .populate('addedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalGrades = grades.length;
    const avgPercentage = totalGrades > 0
      ? (grades.reduce((sum, g) => sum + parseFloat(g.percentage || 0), 0) / totalGrades).toFixed(1)
      : 0;

    // Group by subject
    const gradesBySubject = {};
    grades.forEach(grade => {
      const subjectName = grade.subject?.name || 'Unknown';
      if (!gradesBySubject[subjectName]) {
        gradesBySubject[subjectName] = [];
      }
      gradesBySubject[subjectName].push(grade);
    });

    res.json({
      success: true,
      data: {
        grades,
        stats: {
          totalGrades,
          avgPercentage: `${avgPercentage}%`,
          gradesBySubject
        }
      }
    });

  } catch (error) {
    console.error('Student Grades API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message
    });
  }
}
