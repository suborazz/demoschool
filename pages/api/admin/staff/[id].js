import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Staff from '../../../../models/Staff';
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

    // PUT - Update staff
    if (req.method === 'PUT') {
      console.log('Update request received for staff ID:', id);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const {
        firstName,
        lastName,
        email,
        phone,
        personalEmail,
        dateOfBirth,
        gender,
        address,
        department,
        designation,
        dateOfJoining,
        qualification,
        experience,
        salary,
        bankDetails,
        alternateContact,
        emergencyContact
      } = req.body;

      // Find the staff member
      const staff = await Staff.findById(id).populate('user');
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }
      
      console.log('Current staff data before update:', {
        user: staff.user,
        department: staff.department,
        designation: staff.designation
      });

      // Check if user reference exists
      if (!staff.user) {
        console.error('Staff user reference is null. Staff ID:', id);
        return res.status(500).json({
          success: false,
          message: 'Staff user reference is broken. Please contact administrator to fix this data issue.',
          details: 'The user account associated with this staff member is missing.'
        });
      }

      // Server-side validation
      const validationErrors = [];

      // Validate required fields
      if (firstName !== undefined && !firstName.trim()) {
        validationErrors.push('First name cannot be empty');
      }
      if (lastName !== undefined && !lastName.trim()) {
        validationErrors.push('Last name cannot be empty');
      }
      if (email !== undefined && !email.trim()) {
        validationErrors.push('Email cannot be empty');
      }
      if (phone !== undefined && !phone.trim()) {
        validationErrors.push('Phone cannot be empty');
      }
      if (department !== undefined && !department) {
        validationErrors.push('Department is required');
      }
      if (designation !== undefined && !designation.trim()) {
        validationErrors.push('Designation cannot be empty');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        validationErrors.push('Invalid email format');
      }
      if (personalEmail && personalEmail.trim() && !emailRegex.test(personalEmail)) {
        validationErrors.push('Invalid personal email format');
      }

      // Validate phone number
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (phone && !phoneRegex.test(phone)) {
        validationErrors.push('Invalid phone number format');
      }
      if (phone && phone.replace(/\D/g, '').length < 10) {
        validationErrors.push('Phone number must have at least 10 digits');
      }

      // Validate name length
      if (firstName && firstName.trim().length < 2) {
        validationErrors.push('First name must be at least 2 characters');
      }
      if (lastName && lastName.trim().length < 2) {
        validationErrors.push('Last name must be at least 2 characters');
      }

      // Validate salary
      if (salary?.basicSalary !== undefined && salary.basicSalary <= 0) {
        validationErrors.push('Basic salary must be greater than 0');
      }
      if (salary?.allowances?.houseRent !== undefined && salary.allowances.houseRent < 0) {
        validationErrors.push('House rent allowance cannot be negative');
      }
      if (salary?.allowances?.transport !== undefined && salary.allowances.transport < 0) {
        validationErrors.push('Transport allowance cannot be negative');
      }
      if (salary?.allowances?.medical !== undefined && salary.allowances.medical < 0) {
        validationErrors.push('Medical allowance cannot be negative');
      }

      // Check if email is already taken by another user
      if (email && staff.user && email.toLowerCase() !== staff.user.email.toLowerCase()) {
        const existingUser = await User.findOne({ 
          email: email.toLowerCase(),
          _id: { $ne: staff.user._id }
        });
        if (existingUser) {
          validationErrors.push('This email is already registered to another user');
        }
      } else if (email && !staff.user) {
        // If user reference is missing, check if email exists anywhere
        const existingUser = await User.findOne({ 
          email: email.toLowerCase()
        });
        if (existingUser) {
          validationErrors.push('This email is already registered to another user');
        }
      }

      // Return validation errors if any
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Update user information
      // Note: Names can be changed to anything, including duplicates
      const updateUserData = {};
      if (firstName !== undefined) updateUserData.firstName = firstName;
      if (lastName !== undefined) updateUserData.lastName = lastName;
      if (email !== undefined) updateUserData.email = email.toLowerCase();
      if (phone !== undefined) updateUserData.phone = phone;
      if (personalEmail !== undefined) updateUserData.personalEmail = personalEmail ? personalEmail.toLowerCase() : '';
      if (dateOfBirth !== undefined) updateUserData.dateOfBirth = dateOfBirth;
      if (gender !== undefined) updateUserData.gender = gender;
      if (address !== undefined) updateUserData.address = address;

      // Update with { new: true } to return updated document
      await User.findByIdAndUpdate(
        staff.user, 
        { $set: updateUserData },
        { new: true, runValidators: true }
      );

      // Update staff information
      const updateStaffData = {};
      if (department !== undefined) updateStaffData.department = department;
      if (designation !== undefined) updateStaffData.designation = designation;
      if (dateOfJoining !== undefined) updateStaffData.dateOfJoining = dateOfJoining;
      if (qualification !== undefined) updateStaffData.qualification = qualification;
      if (experience !== undefined) updateStaffData.experience = experience;
      if (salary !== undefined) updateStaffData.salary = salary;
      if (bankDetails !== undefined) updateStaffData.bankDetails = bankDetails;
      if (alternateContact !== undefined) updateStaffData.alternateContact = alternateContact;
      if (emergencyContact !== undefined) updateStaffData.emergencyContact = emergencyContact;

      // Update with { new: true } to return updated document
      await Staff.findByIdAndUpdate(
        id, 
        { $set: updateStaffData },
        { new: true, runValidators: true }
      );

      // Fetch updated staff
      const updatedStaff = await Staff.findById(id)
        .populate('user', 'firstName lastName email personalEmail phone gender dateOfBirth address isActive')
        .populate('subjects')
        .populate('classes.class');

      console.log('Updated staff data:', {
        user: updatedStaff.user,
        department: updatedStaff.department,
        designation: updatedStaff.designation
      });

      return res.status(200).json({
        success: true,
        message: 'Staff member updated successfully',
        data: updatedStaff
      });
    }

    // DELETE - Delete staff
    if (req.method === 'DELETE') {
      // Find the staff member
      const staff = await Staff.findById(id);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Delete the associated user account
      await User.findByIdAndDelete(staff.user);

      // Delete the staff record
      await Staff.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Staff member deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Staff API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

