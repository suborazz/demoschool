import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Student from '../../../models/Student';
import Grade from '../../../models/Grade';
import AttendanceStudent from '../../../models/AttendanceStudent';
import Parent from '../../../models/Parent';
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

    // Get student ID from query
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    // Find staff profile
    const staff = await Staff.findOne({ user: userId });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // Find student with full details
    const student = await Student.findById(studentId)
      .populate('user', 'firstName lastName email')
      .populate('class', 'name grade section');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Try to populate parent separately (it might not exist)
    let parentInfo = null;
    try {
      if (student.parent) {
        parentInfo = await Parent.findById(student.parent).select('contactNumber email');
      }
    } catch (error) {
      console.log('Parent fetch error:', error.message);
    }

    // Get current academic year
    const currentYear = new Date().getFullYear().toString();

    // Get all grades for this student
    let grades = [];
    try {
      grades = await Grade.find({ 
        student: studentId,
        academicYear: currentYear
      })
        .populate('subject', 'name code')
        .populate('class', 'name')
        .sort({ examDate: -1 });
    } catch (error) {
      console.log('Grades fetch error:', error.message);
      // Continue with empty grades if there's an error
    }

    // Calculate grade statistics
    const gradeStats = {
      totalExams: grades.length,
      averagePercentage: 0,
      highestPercentage: 0,
      lowestPercentage: 100,
      totalPassed: 0,
      totalFailed: 0,
      subjectWisePerformance: {}
    };

    if (grades.length > 0) {
      const percentages = grades.map(g => g.percentage);
      gradeStats.averagePercentage = (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2);
      gradeStats.highestPercentage = Math.max(...percentages).toFixed(2);
      gradeStats.lowestPercentage = Math.min(...percentages).toFixed(2);
      gradeStats.totalPassed = grades.filter(g => g.isPassed).length;
      gradeStats.totalFailed = grades.filter(g => !g.isPassed).length;

      // Calculate subject-wise performance
      grades.forEach(grade => {
        const subjectName = grade.subject?.name || 'Unknown';
        if (!gradeStats.subjectWisePerformance[subjectName]) {
          gradeStats.subjectWisePerformance[subjectName] = {
            examCount: 0,
            totalPercentage: 0,
            averagePercentage: 0,
            grades: []
          };
        }
        gradeStats.subjectWisePerformance[subjectName].examCount++;
        gradeStats.subjectWisePerformance[subjectName].totalPercentage += grade.percentage;
        gradeStats.subjectWisePerformance[subjectName].grades.push(grade.grade);
      });

      // Calculate averages
      Object.keys(gradeStats.subjectWisePerformance).forEach(subject => {
        const perf = gradeStats.subjectWisePerformance[subject];
        perf.averagePercentage = (perf.totalPercentage / perf.examCount).toFixed(2);
      });
    }

    // Get attendance records for current academic year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(parseInt(currentYear) + 1, 0, 0);

    let attendanceRecords = [];
    try {
      attendanceRecords = await AttendanceStudent.find({
        student: studentId,
        date: { $gte: startOfYear, $lte: endOfYear }
      }).sort({ date: -1 });
    } catch (error) {
      console.log('Attendance fetch error:', error.message);
      // Continue with empty attendance if there's an error
    }

    // Calculate attendance statistics
    const attendanceStats = {
      totalDays: attendanceRecords.length,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      onLeave: 0,
      attendancePercentage: 0
    };

    attendanceRecords.forEach(record => {
      switch (record.status) {
        case 'present':
          attendanceStats.present++;
          break;
        case 'absent':
          attendanceStats.absent++;
          break;
        case 'late':
          attendanceStats.late++;
          break;
        case 'half_day':
          attendanceStats.halfDay++;
          break;
        case 'on_leave':
          attendanceStats.onLeave++;
          break;
      }
    });

    if (attendanceStats.totalDays > 0) {
      // Calculate attendance percentage (present + late + half_day as 0.5)
      const effectivePresent = attendanceStats.present + attendanceStats.late + (attendanceStats.halfDay * 0.5);
      attendanceStats.attendancePercentage = ((effectivePresent / attendanceStats.totalDays) * 100).toFixed(2);
    }

    // Get recent attendance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let recentAttendance = [];
    try {
      recentAttendance = await AttendanceStudent.find({
        student: studentId,
        date: { $gte: thirtyDaysAgo }
      })
        .sort({ date: -1 })
        .limit(30);
    } catch (error) {
      console.log('Recent attendance fetch error:', error.message);
    }

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: `${student.user?.firstName} ${student.user?.lastName}`,
          email: student.user?.email,
          admissionNumber: student.admissionNumber,
          rollNumber: student.rollNumber,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          bloodGroup: student.bloodGroup,
          class: student.class,
          parent: parentInfo,
          address: student.address
        },
        grades: grades.map(g => ({
          _id: g._id,
          subject: g.subject?.name,
          subjectCode: g.subject?.code,
          examType: g.examType,
          examDate: g.examDate,
          marksObtained: g.marksObtained,
          totalMarks: g.totalMarks,
          percentage: g.percentage,
          grade: g.grade,
          isPassed: g.isPassed,
          remarks: g.remarks
        })),
        gradeStats,
        attendanceRecords: recentAttendance.map(a => ({
          date: a.date,
          status: a.status,
          remarks: a.remarks
        })),
        attendanceStats,
        academicYear: currentYear
      }
    });

  } catch (error) {
    console.error('Student Report API Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student report',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

