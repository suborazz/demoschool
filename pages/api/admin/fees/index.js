import connectDB from '../../../../lib/mongodb';
import Fee from '../../../../models/Fee';
import Student from '../../../../models/Student';
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
    const adminUser = await User.findById(userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    // GET - Fetch all fees
    if (req.method === 'GET') {
      const fees = await Fee.find()
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        })
        .sort({ createdAt: -1 });

      // Calculate stats
      const totalCollected = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
      const totalPending = fees.reduce((sum, fee) => sum + fee.amountPending, 0);
      const overdueFees = fees.filter(fee => fee.status === 'overdue').length;

      return res.status(200).json({
        success: true,
        count: fees.length,
        data: fees,
        stats: {
          totalCollected,
          totalPending,
          overdueFees,
          totalStudents: await Student.countDocuments()
        }
      });
    }

    // POST - Create new fee record
    if (req.method === 'POST') {
      const {
        studentId,
        feeType,
        totalAmount,
        dueDate,
        academicYear,
        remarks
      } = req.body;

      // Validation
      const validationErrors = [];

      if (!studentId) validationErrors.push('Student is required');
      if (!feeType) validationErrors.push('Fee type is required');
      if (!totalAmount || totalAmount <= 0) validationErrors.push('Total amount must be greater than 0');
      if (!dueDate) validationErrors.push('Due date is required');
      if (!academicYear) validationErrors.push('Academic year is required');

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Create fee record
      const newFee = await Fee.create({
        student: studentId,
        feeType,
        totalAmount: parseFloat(totalAmount),
        amountPaid: 0,
        amountPending: parseFloat(totalAmount),
        dueDate,
        academicYear,
        remarks: remarks || '',
        status: 'pending'
      });

      const populatedFee = await Fee.findById(newFee._id)
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        });

      return res.status(201).json({
        success: true,
        message: 'Fee record created successfully',
        data: populatedFee
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Fee API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

