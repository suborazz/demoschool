import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Student from '../../../../models/Student';
import Class from '../../../../models/Class';
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

    // Use decoded.id (from generateToken)
    const userId = decoded.id || decoded.userId;
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.query;

    // PUT - Update student
    if (req.method === 'PUT') {
      const {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        admissionNumber,
        rollNumber,
        classId,
        section,
        academicYear,
        dateOfAdmission,
        previousSchool,
        bloodGroup,
        emergencyContact,
        medicalInfo
      } = req.body;

      // Find the student
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if class exists if classId is provided
      if (classId) {
        const classExists = await Class.findById(classId);
        if (!classExists) {
          return res.status(400).json({
            success: false,
            message: 'Invalid class selected'
          });
        }
      }

      // Update user information
      const updateUserData = {};
      if (firstName) updateUserData.firstName = firstName;
      if (lastName) updateUserData.lastName = lastName;
      if (email) updateUserData.email = email.toLowerCase();
      if (phone) updateUserData.phone = phone;
      if (dateOfBirth) updateUserData.dateOfBirth = dateOfBirth;
      if (gender) updateUserData.gender = gender;
      if (address) updateUserData.address = address;

      await User.findByIdAndUpdate(student.user, updateUserData);

      // Update student information
      const updateStudentData = {};
      if (admissionNumber) updateStudentData.admissionNumber = admissionNumber;
      if (rollNumber) updateStudentData.rollNumber = rollNumber;
      if (classId) updateStudentData.class = classId;
      if (section) updateStudentData.section = section;
      if (academicYear) updateStudentData.academicYear = academicYear;
      if (dateOfAdmission) updateStudentData.dateOfAdmission = dateOfAdmission;
      if (previousSchool) updateStudentData.previousSchool = previousSchool;
      if (bloodGroup) updateStudentData.bloodGroup = bloodGroup;
      if (emergencyContact) updateStudentData.emergencyContact = emergencyContact;
      if (medicalInfo) updateStudentData.medicalInfo = medicalInfo;

      await Student.findByIdAndUpdate(id, updateStudentData);

      // Fetch updated student
      const updatedStudent = await Student.findById(id)
        .populate('user', 'firstName lastName email phone gender dateOfBirth address isActive')
        .populate('class', 'name grade sections academicYear')
        .populate({
          path: 'parents',
          populate: {
            path: 'user',
            select: 'firstName lastName email phone'
          }
        });

      return res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        student: updatedStudent
      });
    }

    // DELETE - Delete student
    if (req.method === 'DELETE') {
      // Find the student
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Delete the associated user account
      await User.findByIdAndDelete(student.user);

      // Delete the student record
      await Student.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Student deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Student API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

