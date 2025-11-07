import connectDB from '../../../lib/mongodb';
import Grade from '../../../models/Grade';
import Class from '../../../models/Class';
import Staff from '../../../models/Staff';
import Student from '../../../models/Student';
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
          data: []
        });
      }

      const grades = await Grade.find(query)
        .populate({
          path: 'student',
          populate: { path: 'user', select: 'firstName lastName email' }
        })
        .populate('subject')
        .populate('class')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
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
        maxMarks,
        marksObtained,
        remarks
      } = req.body;

      // Validation
      const validationErrors = [];
      if (!studentId) validationErrors.push('Student is required');
      if (!classId) validationErrors.push('Class is required');
      if (!subjectId) validationErrors.push('Subject is required');
      if (!examType) validationErrors.push('Exam type is required');
      if (!maxMarks || maxMarks <= 0) validationErrors.push('Max marks must be greater than 0');
      if (marksObtained === undefined || marksObtained < 0) validationErrors.push('Marks obtained is required');
      if (marksObtained > maxMarks) validationErrors.push('Marks obtained cannot exceed max marks');

      if (validationErrors.length > 0) {
        return res.status(400).json({ success: false, message: validationErrors.join('. ') });
      }

      // Check if staff can add grades for this class
      // Allow if: 1) Staff teaches the subject, OR 2) Staff is class teacher for this class
      const teachesSubject = staff.subjects && staff.subjects.some(s => s._id.toString() === subjectId);
      const teachesClassFromStaff = staff.classes && staff.classes.some(c => c.class?._id?.toString() === classId);
      const isClassTeacher = await Class.findOne({ _id: classId, classTeacher: staff._id });
      
      if (!teachesSubject && !teachesClassFromStaff && !isClassTeacher) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not assigned to this subject or class. Please contact admin.' 
        });
      }

      // Get subject details for passing marks
      const Subject = require('../../../models/Subject').default;
      const subjectDoc = await Subject.findById(subjectId);
      const passingMarks = subjectDoc?.passingMarks || Math.round(maxMarks * 0.33);

      // Create grade (Grade model will calculate percentage, grade, and isPassed in pre-save hook)
      const newGrade = await Grade.create({
        student: studentId,
        class: classId,
        subject: subjectId,
        examType,
        totalMarks: maxMarks,
        marksObtained,
        passingMarks,
        examDate: new Date(),
        remarks: remarks || '',
        academicYear: new Date().getFullYear().toString(),
        enteredBy: staff._id
      });

      const populatedGrade = await Grade.findById(newGrade._id)
        .populate({
          path: 'student',
          populate: { path: 'user', select: 'firstName lastName email' }
        })
        .populate('subject')
        .populate('class');

      return res.status(201).json({
        success: true,
        message: 'Grade added successfully',
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

