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
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }

    const userId = decoded.id || decoded.userId;
    
    // Verify user exists and is active
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is inactive. Please contact admin.' });
    }
    
    if (user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
    }

    // Find staff profile
    const staff = await Staff.findOne({ user: userId })
      .populate('classes.class')
      .populate('subjects');

    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff profile not found. Please contact admin to set up your profile.' 
      });
    }

    // Get classes from both sources
    const classIdsFromStaff = staff.classes && staff.classes.length > 0
      ? staff.classes.map(c => c.class?._id).filter(Boolean)
      : [];
    
    const classesAsTeacher = await Class.find({ classTeacher: staff._id });
    const classIdsFromTeacher = classesAsTeacher.map(c => c._id);
    const allClassIds = [...new Set([...classIdsFromStaff, ...classIdsFromTeacher])];

    if (allClassIds.length === 0) {
      return res.json({
        success: true,
        message: 'No classes assigned',
        data: {
          staffName: `${user.firstName} ${user.lastName}`,
          totalClasses: 0,
          classes: []
        }
      });
    }

    // Fetch all classes with details
    const classes = await Class.find({ _id: { $in: allClassIds } })
      .select('name grade section room academicYear');

    // Get current academic year
    const currentYear = new Date().getFullYear().toString();

    // Build analytics for each class
    const classAnalytics = await Promise.all(
      classes.map(async (classItem) => {
        try {
          // Get students in this class
          const students = await Student.find({ class: classItem._id })
            .populate('user', 'firstName lastName email isActive')
            .select('rollNumber admissionNumber user');

          // Filter only active students
          const activeStudents = students.filter(s => s.user?.isActive !== false);
          const studentIds = activeStudents.map(s => s._id);

          if (studentIds.length === 0) {
            // Return empty analytics if no students
            return {
              classId: classItem._id,
              className: classItem.name || 'Unnamed Class',
              grade: classItem.grade || 'N/A',
              section: classItem.section || 'N/A',
              room: classItem.room || 'Not Assigned',
              totalStudents: 0,
              gradeStats: {
                totalExams: 0,
                averagePercentage: '0.00',
                highestScore: '0.00',
                lowestScore: '0.00',
                passRate: '0.00',
                gradeDistribution: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 },
                subjectPerformance: {}
              },
              attendanceStats: {
                totalRecords: 0,
                present: 0,
                absent: 0,
                late: 0,
                attendanceRate: '0.00',
                dailyAttendance: {}
              },
              topPerformers: [],
              needsAttention: [],
              recentGrades: []
            };
          }

          // Get grades for this class (only for subjects this staff teaches)
          const staffSubjectIds = staff.subjects && staff.subjects.length > 0
            ? staff.subjects.map(s => s._id)
            : [];

          let grades = [];
          if (staffSubjectIds.length > 0) {
            grades = await Grade.find({
              class: classItem._id,
              student: { $in: studentIds },
              academicYear: currentYear,
              subject: { $in: staffSubjectIds }
            })
              .populate('subject', 'name code')
              .populate('student', 'rollNumber admissionNumber');
          }

          // Calculate grade statistics with validation
          const gradeStats = {
            totalExams: grades.length,
            averagePercentage: '0.00',
            highestScore: '0.00',
            lowestScore: '0.00',
            passRate: '0.00',
            gradeDistribution: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 },
            subjectPerformance: {}
          };

          if (grades.length > 0) {
            // Validate percentages are within range
            const validPercentages = grades
              .map(g => g.percentage)
              .filter(p => p !== undefined && p !== null && p >= 0 && p <= 100);
            
            if (validPercentages.length > 0) {
              gradeStats.averagePercentage = (validPercentages.reduce((a, b) => a + b, 0) / validPercentages.length).toFixed(2);
              gradeStats.highestScore = Math.max(...validPercentages).toFixed(2);
              gradeStats.lowestScore = Math.min(...validPercentages).toFixed(2);
            }
            
            const passedCount = grades.filter(g => g.isPassed === true).length;
            gradeStats.passRate = grades.length > 0 ? ((passedCount / grades.length) * 100).toFixed(2) : '0.00';

            // Grade distribution
            grades.forEach(g => {
              if (g.grade && gradeStats.gradeDistribution[g.grade] !== undefined) {
                gradeStats.gradeDistribution[g.grade]++;
              }
            });

            // Subject-wise performance
            grades.forEach(grade => {
              const subjectName = grade.subject?.name || 'Unknown Subject';
              if (!gradeStats.subjectPerformance[subjectName]) {
                gradeStats.subjectPerformance[subjectName] = {
                  count: 0,
                  totalPercentage: 0,
                  average: '0.00'
                };
              }
              
              if (grade.percentage !== undefined && grade.percentage !== null) {
                gradeStats.subjectPerformance[subjectName].count++;
                gradeStats.subjectPerformance[subjectName].totalPercentage += grade.percentage;
              }
            });

            // Calculate averages for each subject
            Object.keys(gradeStats.subjectPerformance).forEach(subject => {
              const perf = gradeStats.subjectPerformance[subject];
              if (perf.count > 0) {
                perf.average = (perf.totalPercentage / perf.count).toFixed(2);
              }
              // Remove totalPercentage as it's not needed in response
              delete perf.totalPercentage;
            });
          }

          // Get attendance for this class (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const attendanceRecords = await AttendanceStudent.find({
            class: classItem._id,
            date: { $gte: thirtyDaysAgo },
            student: { $in: studentIds }
          }).select('date status student');

          // Calculate attendance statistics
          const attendanceStats = {
            totalRecords: attendanceRecords.length,
            present: 0,
            absent: 0,
            late: 0,
            halfDay: 0,
            onLeave: 0,
            attendanceRate: '0.00',
            dailyAttendance: {}
          };

          attendanceRecords.forEach(record => {
            if (!record.status) return;
            
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
            
            switch (record.status.toLowerCase()) {
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
              case 'half_day':
                attendanceStats.halfDay++;
                break;
              case 'on_leave':
                attendanceStats.onLeave++;
                break;
            }
          });

          if (attendanceStats.totalRecords > 0) {
            // Present + Late + (HalfDay * 0.5) + OnLeave
            const effectivePresent = attendanceStats.present + 
                                    attendanceStats.late + 
                                    (attendanceStats.halfDay * 0.5) +
                                    attendanceStats.onLeave;
            attendanceStats.attendanceRate = ((effectivePresent / attendanceStats.totalRecords) * 100).toFixed(2);
          }

          // Calculate student-wise performance
          const studentPerformance = {};
          grades.forEach(grade => {
            const studentId = grade.student?._id?.toString() || grade.student?.toString();
            if (!studentId) return;
            
            if (!studentPerformance[studentId]) {
              studentPerformance[studentId] = {
                totalPercentage: 0,
                count: 0,
                average: 0
              };
            }
            
            if (grade.percentage !== undefined && grade.percentage !== null) {
              studentPerformance[studentId].totalPercentage += grade.percentage;
              studentPerformance[studentId].count++;
            }
          });

          // Calculate averages and build student lists
          const performanceList = [];
          Object.keys(studentPerformance).forEach(studentId => {
            const perf = studentPerformance[studentId];
            if (perf.count > 0) {
              perf.average = perf.totalPercentage / perf.count;
              
              const student = activeStudents.find(s => s._id.toString() === studentId);
              if (student && student.user) {
                performanceList.push({
                  studentId: student._id,
                  name: `${student.user.firstName || ''} ${student.user.lastName || ''}`.trim(),
                  rollNumber: student.rollNumber || 'N/A',
                  average: perf.average.toFixed(2)
                });
              }
            }
          });

          // Sort by average descending
          performanceList.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
          
          // Get top 5 performers
          const topPerformers = performanceList.slice(0, 5);

          // Get students needing attention (below 50%)
          const needsAttention = performanceList
            .filter(p => parseFloat(p.average) < 50)
            .slice(0, 5);

          return {
            classId: classItem._id,
            className: classItem.name || 'Unnamed Class',
            grade: classItem.grade || 'N/A',
            section: classItem.section || 'N/A',
            room: classItem.room || 'Not Assigned',
            totalStudents: activeStudents.length,
            gradeStats,
            attendanceStats,
            topPerformers,
            needsAttention,
            recentGrades: grades
              .slice(0, 10)
              .map(g => ({
                subject: g.subject?.name || 'Unknown',
                examType: g.examType || 'N/A',
                date: g.examDate || new Date(),
                averageScore: g.percentage?.toFixed(2) || '0.00'
              }))
          };
        } catch (classError) {
          console.error(`Error processing class ${classItem.name}:`, classError);
          // Return empty analytics for this class if error
          return {
            classId: classItem._id,
            className: classItem.name || 'Unnamed Class',
            grade: classItem.grade || 'N/A',
            section: classItem.section || 'N/A',
            room: classItem.room || 'Not Assigned',
            totalStudents: 0,
            gradeStats: {
              totalExams: 0,
              averagePercentage: '0.00',
              highestScore: '0.00',
              lowestScore: '0.00',
              passRate: '0.00',
              gradeDistribution: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 },
              subjectPerformance: {}
            },
            attendanceStats: {
              totalRecords: 0,
              present: 0,
              absent: 0,
              late: 0,
              attendanceRate: '0.00',
              dailyAttendance: {}
            },
            topPerformers: [],
            needsAttention: [],
            recentGrades: [],
            error: 'Failed to load analytics for this class'
          };
        }
      })
    );

    return res.json({
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
    
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching class analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
