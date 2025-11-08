import connectDB from '../../../lib/mongodb';
import Grade from '../../../models/Grade';
import Class from '../../../models/Class';
import Staff from '../../../models/Staff';
import Student from '../../../models/Student';
import Subject from '../../../models/Subject';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
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
      .populate('subjects')
      .populate('classes.class');
    
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // GET - Fetch grades
    if (req.method === 'GET') {
      // Get all classes this staff can access (from both sources)
      const classIdsFromStaff = staff.classes && staff.classes.length > 0 
        ? staff.classes.map(c => c.class?._id).filter(Boolean) 
        : [];
      
      const classesAsTeacher = await Class.find({ classTeacher: staff._id });
      const classIdsFromTeacher = classesAsTeacher.map(c => c._id);
      
      const allClassIds = [...new Set([...classIdsFromStaff, ...classIdsFromTeacher])];

      // Fetch grades based on:
      // 1. Subjects staff teaches (if any)
      // 2. OR classes staff is assigned to (including as class teacher)
      const query = {};
      
      if (staff.subjects && staff.subjects.length > 0) {
        // If staff has subjects, fetch grades for those subjects
        query.subject = { $in: staff.subjects.map(s => s._id) };
      } else if (allClassIds.length > 0) {
        // If no subjects but has classes, fetch all grades for those classes
        query.class = { $in: allClassIds };
      } else {
        // If neither subjects nor classes, return empty array
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }

      const grades = await Grade.find(query)
        .populate({
          path: 'student',
          populate: { path: 'user', select: 'firstName lastName email' }
        })
        .populate('subject', 'name code')
        .populate('class', 'name grade section')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: grades.length,
        data: grades
      });
    }

    // POST - Add grade
    if (req.method === 'POST') {
      const {
        studentId,
        classId,
        subjectId,
        examType,
        examDate,
        academicYear,
        maxMarks,
        marksObtained,
        remarks
      } = req.body;

      // Comprehensive validation
      const validationErrors = [];
      
      if (!studentId) validationErrors.push('Student is required');
      if (!classId) validationErrors.push('Class is required');
      if (!subjectId) validationErrors.push('Subject is required');
      if (!examType) validationErrors.push('Exam type is required');
      if (!examDate) validationErrors.push('Exam date is required');
      if (!academicYear) validationErrors.push('Academic year is required');
      if (!maxMarks || maxMarks <= 0) validationErrors.push('Max marks must be greater than 0');
      if (maxMarks > 1000) validationErrors.push('Max marks seems too high (maximum 1000 allowed)');
      if (marksObtained === undefined || marksObtained === null || marksObtained < 0) {
        validationErrors.push('Marks obtained is required and cannot be negative');
      }
      if (marksObtained > maxMarks) validationErrors.push('Marks obtained cannot exceed max marks');

      // Validate exam date
      const examDateObj = new Date(examDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (examDateObj > today) {
        validationErrors.push('Exam date cannot be in the future');
      }

      // Validate academic year format
      if (academicYear && !/^\d{4}$/.test(academicYear)) {
        validationErrors.push('Academic year must be in YYYY format');
      }

      // Validate exam type against allowed values
      const validExamTypes = [
        'Unit Test', 'Mid Term', 'Final', 'Quarterly', 
        'Half Yearly', 'Annual', 'Assignment', 'Project', 'Quiz'
      ];
      if (examType && !validExamTypes.includes(examType)) {
        validationErrors.push('Invalid exam type');
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: validationErrors.join('. '),
          errors: validationErrors
        });
      }

      // Verify student exists and belongs to the specified class
      const student = await Student.findById(studentId).populate('class');
      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }

      if (student.class?._id?.toString() !== classId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Student does not belong to the specified class' 
        });
      }

      // Verify subject exists
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subject not found' 
        });
      }

      // Verify class exists
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({ 
          success: false, 
          message: 'Class not found' 
        });
      }

      // Check if staff can add grades for this class and subject
      // Allow if: 1) Staff teaches the subject, OR 2) Staff is class teacher for this class
      const teachesSubject = staff.subjects && staff.subjects.some(s => s._id.toString() === subjectId);
      const teachesClassFromStaff = staff.classes && staff.classes.some(c => c.class?._id?.toString() === classId);
      const isClassTeacher = await Class.findOne({ _id: classId, classTeacher: staff._id });
      
      if (!teachesSubject && !teachesClassFromStaff && !isClassTeacher) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not assigned to teach this subject or class. Please contact admin.' 
        });
      }

      // Check for duplicate grade entry
      // Same student + subject + exam type + academic year
      const duplicateGrade = await Grade.findOne({
        student: studentId,
        subject: subjectId,
        examType: examType,
        academicYear: academicYear
      });

      if (duplicateGrade) {
        return res.status(400).json({ 
          success: false, 
          message: `Grade already exists for this student in ${subject.name} for ${examType} in academic year ${academicYear}. Cannot add duplicate grades.` 
        });
      }

      // Get subject details for passing marks
      const passingMarks = subject.passingMarks || Math.round(maxMarks * 0.33);

      // Create grade (Grade model will calculate percentage, grade, and isPassed in pre-save hook)
      const newGrade = await Grade.create({
        student: studentId,
        class: classId,
        subject: subjectId,
        examType,
        examDate: examDateObj,
        academicYear,
        totalMarks: maxMarks,
        marksObtained,
        passingMarks,
        remarks: remarks || '',
        enteredBy: staff._id
      });

      // Populate the created grade
      const populatedGrade = await Grade.findById(newGrade._id)
        .populate({
          path: 'student',
          populate: { path: 'user', select: 'firstName lastName email' }
        })
        .populate('subject', 'name code')
        .populate('class', 'name grade section');

      return res.status(201).json({
        success: true,
        message: `Grade added successfully! ${student.user?.firstName} scored ${newGrade.grade} (${newGrade.percentage.toFixed(2)}%)`,
        data: populatedGrade
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Grades API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}
