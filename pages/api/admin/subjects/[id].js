import connectDB from '../../../../lib/mongodb';
import Subject from '../../../../models/Subject';
import User from '../../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    await connectDB();

    // Verify admin authentication
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
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.query;

    // PUT - Update subject
    if (req.method === 'PUT') {
      const {
        name,
        code,
        description,
        category,
        totalMarks,
        passingMarks,
        isActive
      } = req.body;

      const subject = await Subject.findById(id);
      if (!subject) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
      }

      // If code is being changed, check if new code already exists
      if (code && code.toUpperCase() !== subject.code) {
        const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
        if (existingSubject) {
          return res.status(400).json({
            success: false,
            message: 'Subject code already exists. Please use a different code.'
          });
        }
      }

      // Update subject
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (code !== undefined) updateData.code = code.toUpperCase().trim();
      if (description !== undefined) updateData.description = description.trim();
      if (category !== undefined) updateData.category = category;
      if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
      if (passingMarks !== undefined) updateData.passingMarks = passingMarks;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedSubject = await Subject.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        data: updatedSubject
      });
    }

    // DELETE - Delete subject
    if (req.method === 'DELETE') {
      const subject = await Subject.findById(id);
      if (!subject) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
      }

      await Subject.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Subject deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Subject API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}


