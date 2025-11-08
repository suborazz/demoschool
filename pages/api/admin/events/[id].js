import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  eventType: { type: String, enum: ['holiday', 'exam', 'meeting', 'sports', 'cultural', 'academic', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  location: { type: String, trim: true },
  targetAudience: { type: String, enum: ['all', 'students', 'staff', 'parents'], default: 'all' },
  color: { type: String, default: 'blue' },
  isPublic: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

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

    // PUT - Update event
    if (req.method === 'PUT') {
      const { title, description, eventType, startDate, endDate, startTime, endTime, location, targetAudience, color } = req.body;

      // Validate dates are not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        if (start < today) {
          return res.status(400).json({
            success: false,
            message: 'Start date cannot be in the past. Please select today or a future date.'
          });
        }
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        
        if (end < today) {
          return res.status(400).json({
            success: false,
            message: 'End date cannot be in the past. Please select today or a future date.'
          });
        }
      }

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be on or after start date'
        });
      }

      const event = await Event.findByIdAndUpdate(
        id,
        {
          title: title?.trim(),
          description: description?.trim(),
          eventType,
          startDate,
          endDate,
          startTime,
          endTime,
          location: location?.trim(),
          targetAudience,
          color
        },
        { new: true, runValidators: true }
      ).populate('createdBy', 'firstName lastName');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    }

    // DELETE - Delete event
    if (req.method === 'DELETE') {
      const event = await Event.findByIdAndDelete(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Event API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}
