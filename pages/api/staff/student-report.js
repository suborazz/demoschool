import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import Student from '../../../models/Student';
import Class from '../../../models/Class';
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

    // Validate student ID from query
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    // Find staff profile
    const staff = await Staff.findOne({ user: userId })
      .populate('classes.class')
      .populate('subjects');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found. Please contact admin.' });
    }

    // Find student with full details
    const student = await Student.findById(studentId)
      .populate('user', 'firstName lastName email phone gender dateOfBirth isActive')
      .populate('class', 'name grade section academicYear');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if staff has access to this student
    // Staff can access students from their assigned classes
    const classIdsFromStaff = staff.classes && staff.classes.length > 0
      ? staff.classes.map(c => c.class?._id?.toString()).filter(Boolean)
      : [];
    
    const classesAsTeacher = await Class.find({ classTeacher: staff._id });
    const classIdsFromTeacher = classesAsTeacher.map(c => c._id.toString());
    const allClassIds = [...new Set([...classIdsFromStaff, ...classIdsFromTeacher])];

    const studentClassId = student.class?._id?.toString();
    if (!studentClassId || !allClassIds.includes(studentClassId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have access to this student. Student must be in your assigned classes.' 
      });
    }

    // Try to populate parent separately (might not exist)
    let parentInfo = null;
    try {
      if (student.parents && student.parents.length > 0) {
        // Get first parent
        const parentId = student.parents[0];
        if (parentId) {
          const parent = await Parent.findById(parentId)
            .populate('user', 'firstName lastName email phone');
          if (parent && parent.user) {
            parentInfo = {
              name: `${parent.user.firstName} ${parent.user.lastName}`,
              email: parent.user.email,
              phone: parent.user.phone,
              relation: parent.relation || 'Parent'
            };
          }
        }
      }
    } catch (error) {
      console.log('Parent fetch error:', error.message);
      // Continue without parent info if error
    }

    // Get current academic year
    const currentYear = new Date().getFullYear().toString();
    const academicYear = student.class?.academicYear || currentYear;

    // Get all grades for this student for the academic year
    let grades = [];
    try {
      grades = await Grade.find({ 
        student: studentId,
        academicYear: academicYear
      })
        .populate('subject', 'name code')
        .populate('class', 'name')
        .sort({ examDate: -1 });
    } catch (error) {
      console.log('Grades fetch error:', error.message);
      // Continue with empty grades array
    }

    // Calculate grade statistics with validation
    const gradeStats = {
      totalExams: grades.length,
      averagePercentage: 0,
      highestPercentage: 0,
      lowestPercentage: 0,
      totalPassed: 0,
      totalFailed: 0,
      subjectWisePerformance: {}
    };

    if (grades.length > 0) {
      const percentages = grades.map(g => g.percentage || 0).filter(p => p >= 0 && p <= 100);
      
      if (percentages.length > 0) {
        gradeStats.averagePercentage = (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2);
        gradeStats.highestPercentage = Math.max(...percentages).toFixed(2);
        gradeStats.lowestPercentage = Math.min(...percentages).toFixed(2);
      }
      
      gradeStats.totalPassed = grades.filter(g => g.isPassed === true).length;
      gradeStats.totalFailed = grades.filter(g => g.isPassed === false).length;

      // Calculate subject-wise performance with validation
      grades.forEach(grade => {
        const subjectName = grade.subject?.name || 'Unknown Subject';
        if (!gradeStats.subjectWisePerformance[subjectName]) {
          gradeStats.subjectWisePerformance[subjectName] = {
            examCount: 0,
            totalPercentage: 0,
            averagePercentage: 0,
            grades: []
          };
        }
        
        if (grade.percentage !== undefined && grade.percentage !== null) {
          gradeStats.subjectWisePerformance[subjectName].examCount++;
          gradeStats.subjectWisePerformance[subjectName].totalPercentage += grade.percentage;
          if (grade.grade) {
            gradeStats.subjectWisePerformance[subjectName].grades.push(grade.grade);
          }
        }
      });

      // Calculate averages for each subject
      Object.keys(gradeStats.subjectWisePerformance).forEach(subject => {
        const perf = gradeStats.subjectWisePerformance[subject];
        if (perf.examCount > 0) {
          perf.averagePercentage = (perf.totalPercentage / perf.examCount).toFixed(2);
        }
        // Remove totalPercentage as it's not needed in response
        delete perf.totalPercentage;
      });
    }

    // Get attendance records for the academic year
    const startOfYear = new Date(academicYear, 0, 1);
    const endOfYear = new Date(parseInt(academicYear) + 1, 0, 0);

    let attendanceRecords = [];
    try {
      attendanceRecords = await AttendanceStudent.find({
        student: studentId,
        date: { $gte: startOfYear, $lte: endOfYear }
      })
        .select('date status remarks')
        .sort({ date: -1 });
    } catch (error) {
      console.log('Attendance fetch error:', error.message);
      // Continue with empty attendance array
    }

    // Calculate attendance statistics with validation
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
      if (!record.status) return;
      
      switch (record.status.toLowerCase()) {
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

    // Calculate attendance percentage
    if (attendanceStats.totalDays > 0) {
      // Present + Late + (Half Day * 0.5) + On Leave as present
      const effectivePresent = attendanceStats.present + 
                               attendanceStats.late + 
                               (attendanceStats.halfDay * 0.5) +
                               attendanceStats.onLeave;
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
        .select('date status remarks')
        .sort({ date: -1 })
        .limit(30);
    } catch (error) {
      console.log('Recent attendance fetch error:', error.message);
    }

    // Build response with validated data
    return res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim(),
          email: student.user?.email || 'N/A',
          admissionNumber: student.admissionNumber || 'N/A',
          rollNumber: student.rollNumber || 'N/A',
          dateOfBirth: student.user?.dateOfBirth || null,
          gender: student.user?.gender || 'N/A',
          bloodGroup: student.bloodGroup || 'N/A',
          phone: student.user?.phone || 'N/A',
          class: student.class || { name: 'N/A', grade: 'N/A', section: 'N/A' },
          parent: parentInfo,
          address: student.user?.address || 'N/A',
          isActive: student.user?.isActive !== false
        },
        grades: grades.map(g => ({
          _id: g._id,
          subject: g.subject?.name || 'Unknown',
          subjectCode: g.subject?.code || '',
          examType: g.examType || 'N/A',
          examDate: g.examDate || new Date(),
          marksObtained: g.marksObtained || 0,
          totalMarks: g.totalMarks || 0,
          percentage: g.percentage !== undefined ? g.percentage.toFixed(2) : '0.00',
          grade: g.grade || 'N/A',
          isPassed: g.isPassed === true,
          remarks: g.remarks || ''
        })),
        gradeStats,
        attendanceRecords: recentAttendance.map(a => ({
          date: a.date,
          status: a.status || 'unknown',
          remarks: a.remarks || ''
        })),
        attendanceStats,
        academicYear: academicYear
      }
    });

  } catch (error) {
    console.error('Student Report API Error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching student report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
