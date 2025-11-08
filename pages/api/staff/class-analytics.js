import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Class from '../../../models/Class';
import Student from '../../../models/Student';
import Grade from '../../../models/Grade';
import AttendanceStudent from '../../../models/AttendanceStudent';
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

    // Get classes from both sources
    const classIdsFromStaff = staff.classes.map(c => c.class?._id).filter(Boolean);
    const classesAsTeacher = await Class.find({ classTeacher: staff._id });
    const classIdsFromTeacher = classesAsTeacher.map(c => c._id);
    const allClassIds = [...new Set([...classIdsFromStaff, ...classIdsFromTeacher])];

    if (allClassIds.length === 0) {
      return res.json({
        success: true,
        data: {
          classes: [],
          message: 'No classes assigned'
        }
      });
    }

    // Fetch all classes with details
    const classes = await Class.find({ _id: { $in: allClassIds } });

    // Get current academic year
    const currentYear = new Date().getFullYear().toString();

    // Build analytics for each class
    const classAnalytics = await Promise.all(
      classes.map(async (classItem) => {
        // Get students in this class
        const students = await Student.find({ class: classItem._id })
          .populate('user', 'firstName lastName');

        const studentIds = students.map(s => s._id);

        // Get grades for this class
        const grades = await Grade.find({
          class: classItem._id,
          academicYear: currentYear,
          subject: { $in: staff.subjects.map(s => s._id) }
        }).populate('subject', 'name code');

        // Calculate grade statistics
        const gradeStats = {
          totalExams: grades.length,
          averagePercentage: 0,
          highestScore: 0,
          lowestScore: 100,
          passRate: 0,
          gradeDistribution: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 },
          subjectPerformance: {}
        };

        if (grades.length > 0) {
          const percentages = grades.map(g => g.percentage);
          gradeStats.averagePercentage = (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2);
          gradeStats.highestScore = Math.max(...percentages).toFixed(2);
          gradeStats.lowestScore = Math.min(...percentages).toFixed(2);
          
          const passedCount = grades.filter(g => g.isPassed).length;
          gradeStats.passRate = ((passedCount / grades.length) * 100).toFixed(2);

          // Grade distribution
          grades.forEach(g => {
            if (gradeStats.gradeDistribution[g.grade] !== undefined) {
              gradeStats.gradeDistribution[g.grade]++;
            }
          });

          // Subject-wise performance
          grades.forEach(grade => {
            const subjectName = grade.subject?.name || 'Unknown';
            if (!gradeStats.subjectPerformance[subjectName]) {
              gradeStats.subjectPerformance[subjectName] = {
                count: 0,
                totalPercentage: 0,
                average: 0
              };
            }
            gradeStats.subjectPerformance[subjectName].count++;
            gradeStats.subjectPerformance[subjectName].totalPercentage += grade.percentage;
          });

          // Calculate averages
          Object.keys(gradeStats.subjectPerformance).forEach(subject => {
            const perf = gradeStats.subjectPerformance[subject];
            perf.average = (perf.totalPercentage / perf.count).toFixed(2);
          });
        }

        // Get attendance for this class (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendanceRecords = await AttendanceStudent.find({
          class: classItem._id,
          date: { $gte: thirtyDaysAgo },
          student: { $in: studentIds }
        });

        // Calculate attendance statistics
        const attendanceStats = {
          totalRecords: attendanceRecords.length,
          present: 0,
          absent: 0,
          late: 0,
          attendanceRate: 0,
          dailyAttendance: {}
        };

        attendanceRecords.forEach(record => {
          const dateKey = record.date.toISOString().split('T')[0];
          
          if (!attendanceStats.dailyAttendance[dateKey]) {
            attendanceStats.dailyAttendance[dateKey] = {
              present: 0,
              absent: 0,
              late: 0,
              total: 0
            };
          }

          attendanceStats.dailyAttendance[dateKey].total++;
          
          switch (record.status) {
            case 'present':
              attendanceStats.present++;
              attendanceStats.dailyAttendance[dateKey].present++;
              break;
            case 'absent':
              attendanceStats.absent++;
              attendanceStats.dailyAttendance[dateKey].absent++;
              break;
            case 'late':
              attendanceStats.late++;
              attendanceStats.dailyAttendance[dateKey].late++;
              break;
          }
        });

        if (attendanceStats.totalRecords > 0) {
          const effectivePresent = attendanceStats.present + attendanceStats.late;
          attendanceStats.attendanceRate = ((effectivePresent / attendanceStats.totalRecords) * 100).toFixed(2);
        }

        // Get top performers
        const studentGrades = {};
        grades.forEach(grade => {
          const studentId = grade.student.toString();
          if (!studentGrades[studentId]) {
            studentGrades[studentId] = {
              totalPercentage: 0,
              count: 0,
              average: 0
            };
          }
          studentGrades[studentId].totalPercentage += grade.percentage;
          studentGrades[studentId].count++;
        });

        // Calculate averages and find top performers
        const topPerformers = [];
        Object.keys(studentGrades).forEach(studentId => {
          const perf = studentGrades[studentId];
          perf.average = perf.totalPercentage / perf.count;
          
          const student = students.find(s => s._id.toString() === studentId);
          if (student) {
            topPerformers.push({
              studentId: student._id,
              name: `${student.user?.firstName} ${student.user?.lastName}`,
              rollNumber: student.rollNumber,
              average: perf.average.toFixed(2)
            });
          }
        });

        // Sort by average and get top 5
        topPerformers.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
        const top5 = topPerformers.slice(0, 5);

        // Get students needing attention (below 50%)
        const needsAttention = topPerformers.filter(p => parseFloat(p.average) < 50);

        return {
          classId: classItem._id,
          className: classItem.name,
          grade: classItem.grade,
          section: classItem.section,
          room: classItem.room,
          totalStudents: students.length,
          gradeStats,
          attendanceStats,
          topPerformers: top5,
          needsAttention: needsAttention.slice(0, 5),
          recentGrades: grades.slice(0, 10).map(g => ({
            subject: g.subject?.name,
            examType: g.examType,
            date: g.examDate,
            averageScore: g.percentage
          }))
        };
      })
    );

    res.json({
      success: true,
      data: {
        staffName: `${user.firstName} ${user.lastName}`,
        totalClasses: classes.length,
        classes: classAnalytics
      }
    });

  } catch (error) {
    console.error('Class Analytics API Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

