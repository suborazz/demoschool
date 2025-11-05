import connectDB from '../../../../lib/mongodb';
import Event from '../../../../models/Event';
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

    // PUT - Update event
    if (req.method === 'PUT') {
      const updateData = req.body;

      const updatedEvent = await Event.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('createdBy', 'firstName lastName');

      if (!updatedEvent) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
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

      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Event API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

