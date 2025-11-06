import connectDB from '../../../../lib/mongodb';
import Event from '../../../../models/Event';
import User from '../../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  const { id } = req.query;

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

    // Handle GET request - Get single event
    if (req.method === 'GET') {
      const event = await Event.findById(id);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.json({
        success: true,
        data: event
      });
    }

    // Handle PUT request - Update event
    if (req.method === 'PUT') {
      const {
        title,
        description,
        eventType,
        startDate,
        endDate,
        startTime,
        endTime,
        location,
        targetAudience,
        color
      } = req.body;

      // Validation
      if (!title || !eventType || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Title, event type, start date, and end date are required'
        });
      }

      const event = await Event.findByIdAndUpdate(
        id,
        {
          title,
          description,
          eventType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          startTime,
          endTime,
          location,
          targetAudience: targetAudience || 'all',
          color: color || 'blue',
          updatedBy: userId
        },
        { new: true, runValidators: true }
      );

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

    // Handle DELETE request - Delete event
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

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Event API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
