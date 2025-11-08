import connectDB from '../../../../lib/mongodb';
import Fee from '../../../../models/Fee';
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

    const { id } = req.query;

    // PUT - Record payment
    if (req.method === 'PUT') {
      const {
        paymentAmount,
        paymentMethod,
        transactionId,
        remarks
      } = req.body;

      // Comprehensive Validation
      const validationErrors = [];

      if (!paymentAmount) {
        validationErrors.push('Payment amount is required');
      } else if (paymentAmount <= 0) {
        validationErrors.push('Payment amount must be greater than 0');
      }

      if (!paymentMethod) {
        validationErrors.push('Payment method is required');
      } else {
        const validMethods = ['cash', 'card', 'upi', 'netbanking', 'razorpay', 'other'];
        if (!validMethods.includes(paymentMethod)) {
          validationErrors.push('Invalid payment method');
        }
        
        // Transaction ID required for digital payments
        const digitalPayments = ['card', 'upi', 'netbanking', 'razorpay'];
        if (digitalPayments.includes(paymentMethod) && !transactionId) {
          validationErrors.push('Transaction ID is required for digital payment methods');
        }
        
        if (transactionId && transactionId.length < 4) {
          validationErrors.push('Transaction ID must be at least 4 characters');
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Find fee record
      const fee = await Fee.findById(id);
      if (!fee) {
        return res.status(404).json({
          success: false,
          message: 'Fee record not found'
        });
      }

      // Check if payment exceeds pending amount
      if (parseFloat(paymentAmount) > fee.amountPending) {
        return res.status(400).json({
          success: false,
          message: `Payment amount (₹${paymentAmount}) exceeds pending amount (₹${fee.amountPending})`
        });
      }

      // Generate receipt number
      const receiptNumber = `REC${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Add payment to history
      fee.paymentHistory.push({
        amount: parseFloat(paymentAmount),
        paymentMethod,
        transactionId: transactionId || '',
        paymentDate: new Date(),
        receivedBy: userId,
        remarks: remarks || '',
        receiptNumber
      });

      // Update amount paid
      fee.amountPaid += parseFloat(paymentAmount);
      fee.amountPending = fee.totalAmount - fee.amountPaid + (fee.lateFee?.amount || 0) - (fee.discount?.amount || 0);

      // Update status
      if (fee.amountPending <= 0) {
        fee.status = 'paid';
      } else {
        fee.status = 'partial';
      }

      await fee.save();

      const updatedFee = await Fee.findById(id)
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        });

      return res.status(200).json({
        success: true,
        message: 'Payment recorded successfully',
        data: updatedFee,
        receiptNumber
      });
    }

    // DELETE - Delete fee record
    if (req.method === 'DELETE') {
      const fee = await Fee.findById(id);
      if (!fee) {
        return res.status(404).json({
          success: false,
          message: 'Fee record not found'
        });
      }

      // Check if any payments have been made
      if (fee.amountPaid > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete fee record with payments. Please contact administrator.'
        });
      }

      await Fee.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Fee record deleted successfully'
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

