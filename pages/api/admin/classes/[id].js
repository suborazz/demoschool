import connectDB from '../../../../lib/mongodb';
import Class from '../../../../models/Class';
import Student from '../../../../models/Student';
import Staff from '../../../../models/Staff';
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

    // PUT - Update class
    if (req.method === 'PUT') {
      const {
        name,
        grade,
        section,
        academicYear,
        capacity,
        classTeacher,
        room
      } = req.body;

      // Find the class
      const classDoc = await Class.findById(id);
      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      // Validation
      const validationErrors = [];

      if (name !== undefined && (!name || !name.trim())) {
        validationErrors.push('Class name cannot be empty');
      }
      if (name && name.trim().length < 2) {
        validationErrors.push('Class name must be at least 2 characters');
      }
      if (grade !== undefined && !grade) {
        validationErrors.push('Grade is required');
      }
      if (grade && (grade < 1 || grade > 12)) {
        validationErrors.push('Grade must be between 1 and 12');
      }
      if (capacity !== undefined && capacity < 1) {
        validationErrors.push('Capacity must be at least 1');
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Update class
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (grade !== undefined) updateData.grade = parseInt(grade);
      if (section !== undefined) updateData.section = section;
      if (academicYear !== undefined) updateData.academicYear = academicYear;
      if (capacity !== undefined) updateData.capacity = parseInt(capacity);
      if (classTeacher !== undefined) updateData.classTeacher = classTeacher || null;
      if (room !== undefined) updateData.room = room ? room.trim() : '';

      console.log('Updating class ID:', id);
      console.log('Update data:', updateData);

      // Handle class teacher assignment changes
      if (classTeacher !== undefined) {
        // Remove this class from old teacher's classes array (if exists)
        if (classDoc.classTeacher) {
          await Staff.findByIdAndUpdate(
            classDoc.classTeacher,
            { $pull: { classes: { class: id } } }
          );
        }

        // Add this class to new teacher's classes array (if assigned)
        if (classTeacher) {
          await Staff.findByIdAndUpdate(
            classTeacher,
            {
              $addToSet: {
                classes: {
                  class: id,
                  section: section || classDoc.section,
                  isClassTeacher: true
                }
              }
            }
          );
        }
      }

      const updatedClass = await Class.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate({
        path: 'classTeacher',
        populate: { path: 'user', select: 'firstName lastName email' }
      });

      console.log('Class updated successfully:', updatedClass);

      return res.status(200).json({
        success: true,
        message: 'Class updated successfully',
        data: updatedClass
      });
    }

    // DELETE - Delete class
    if (req.method === 'DELETE') {
      // Find the class
      const classDoc = await Class.findById(id);
      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      // Check if there are students in this class
      const studentCount = await Student.countDocuments({ class: id });
      if (studentCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete class. It has ${studentCount} student(s) enrolled. Please move or remove students first.`
        });
      }

      // Remove this class from assigned teacher's classes array
      if (classDoc.classTeacher) {
        await Staff.findByIdAndUpdate(
          classDoc.classTeacher,
          { $pull: { classes: { class: id } } }
        );
      }

      // Delete the class
      await Class.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Class deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Class API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

