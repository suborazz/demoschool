import connectDB from '../../../lib/mongodb';
import Student from '../../../models/Student';
import Grade from '../../../models/Grade';
import AttendanceStudent from '../../../models/AttendanceStudent';
import Fee from '../../../models/Fee';
import LMSContent from '../../../models/LMSContent';
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
    const student = await Student.findOne({ user: userId })
      .populate('class')
      .populate('parents');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get attendance statistics
    const totalAttendance = await AttendanceStudent.countDocuments({ student: student._id });
    const presentCount = await AttendanceStudent.countDocuments({ 
      student: student._id,
      status: 'present'
    });
    const attendanceRate = totalAttendance > 0 
      ? ((presentCount / totalAttendance) * 100).toFixed(1) 
      : 0;

    // Get recent grades (last 5)
    const recentGrades = await Grade.find({ student: student._id })
      .populate('subject')
      .populate('class')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate average grade
    const allGrades = await Grade.find({ student: student._id });
    const avgPercentage = allGrades.length > 0
      ? (allGrades.reduce((sum, g) => sum + parseFloat(g.percentage || 0), 0) / allGrades.length).toFixed(1)
      : 0;

    // Get overall grade
    let overallGrade = 'N/A';
    if (avgPercentage >= 90) overallGrade = 'A+';
    else if (avgPercentage >= 80) overallGrade = 'A';
    else if (avgPercentage >= 70) overallGrade = 'B';
    else if (avgPercentage >= 60) overallGrade = 'C';
    else if (avgPercentage >= 50) overallGrade = 'D';
    else if (avgPercentage > 0) overallGrade = 'F';

    // Get pending fees
    const pendingFees = await Fee.find({
      student: student._id,
      status: { $in: ['pending', 'partial', 'overdue'] }
    });

    const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + fee.amountPending, 0);

    // Get LMS content count
    const lmsCount = await LMSContent.countDocuments({
      $or: [
        { targetAudience: 'all' },
        { targetClass: student.class?._id }
      ]
    });

    // Calculate class rank (simplified - based on average percentage)
    if (student.class) {
      const classStudents = await Student.find({ class: student.class._id });
      const studentIds = classStudents.map(s => s._id);
      
      const classGrades = await Grade.aggregate([
        { $match: { student: { $in: studentIds } } },
        { $group: { 
            _id: '$student',
            avgPercentage: { $avg: { $toDouble: '$percentage' } }
          }
        },
        { $sort: { avgPercentage: -1 } }
      ]);

      const studentRankIndex = classGrades.findIndex(g => g._id.toString() === student._id.toString());
      const classRank = studentRankIndex >= 0 ? studentRankIndex + 1 : null;
      const totalStudents = classStudents.length;

      res.json({
        success: true,
        data: {
          student: {
            name: `${user.firstName} ${user.lastName}`,
            admissionNumber: student.admissionNumber,
            rollNumber: student.rollNumber,
            class: student.class?.name || 'N/A',
            section: student.section || 'N/A'
          },
          stats: {
            attendanceRate: `${attendanceRate}%`,
            overallGrade,
            avgPercentage: `${avgPercentage}%`,
            totalAssignments: 0, // Placeholder - would need Assignment model
            completedAssignments: 0,
            upcomingTests: 0 // Placeholder - would need Test/Exam model
          },
          recentGrades: recentGrades.map(g => ({
            subject: g.subject?.name || 'N/A',
            marks: `${g.marksObtained}/${g.maxMarks}`,
            grade: g.grade,
            percentage: g.percentage,
            examType: g.examType
          })),
          fees: {
            pending: totalPendingAmount,
            hasPending: pendingFees.length > 0
          },
          lmsResources: lmsCount,
          classRank: {
            rank: classRank,
            total: totalStudents
          }
        }
      });
    } else {
      // Student not assigned to class yet
      res.json({
        success: true,
        data: {
          student: {
            name: `${user.firstName} ${user.lastName}`,
            admissionNumber: student.admissionNumber,
            rollNumber: student.rollNumber,
            class: 'Not Assigned',
            section: 'N/A'
          },
          stats: {
            attendanceRate: `${attendanceRate}%`,
            overallGrade: 'N/A',
            avgPercentage: '0%',
            totalAssignments: 0,
            completedAssignments: 0,
            upcomingTests: 0
          },
          recentGrades: recentGrades.map(g => ({
            subject: g.subject?.name || 'N/A',
            marks: `${g.marksObtained}/${g.maxMarks}`,
            grade: g.grade,
            percentage: g.percentage,
            examType: g.examType
          })),
          fees: {
            pending: totalPendingAmount,
            hasPending: pendingFees.length > 0
          },
          lmsResources: lmsCount,
          classRank: {
            rank: null,
            total: 0
          }
        }
      });
    }

  } catch (error) {
    console.error('Student Dashboard API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
}

