import connectDB from '../../../lib/mongodb';
import Grade from '../../../models/Grade';
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
      const grades = await Grade.find({
        subject: { $in: staff.subjects.map(s => s._id) }
      })
        .populate('student')
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

      // Check if staff teaches this subject
      const teachesSubject = staff.subjects.some(s => s._id.toString() === subjectId);
      if (!teachesSubject) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this subject' });
      }

      // Calculate percentage
      const percentage = ((marksObtained / maxMarks) * 100).toFixed(2);
      
      // Determine grade
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      // Create grade
      const newGrade = await Grade.create({
        student: studentId,
        class: classId,
        subject: subjectId,
        examType,
        maxMarks,
        marksObtained,
        percentage,
        grade,
        remarks: remarks || '',
        academicYear: new Date().getFullYear().toString(),
        addedBy: userId
      });

      const populatedGrade = await Grade.findById(newGrade._id)
        .populate('student')
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

