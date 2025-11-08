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

    // Handle GET request - Fetch all events
    if (req.method === 'GET') {
      const events = await Event.find()
        .populate('createdBy', 'firstName lastName')
        .sort({ startDate: 1 });
      
      console.log('Fetched events count:', events.length);
      
      return res.json({
        success: true,
        count: events.length,
        data: events
      });
    }

    // Handle POST request - Create new event
    if (req.method === 'POST') {
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
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Event title is required'
        });
      }

      if (title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Event title must be at least 3 characters'
        });
      }

      if (!eventType) {
        return res.status(400).json({
          success: false,
          message: 'Event type is required'
        });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      // Validate dates are not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);

      if (start < today) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be in the past. Please select today or a future date.'
        });
      }

      if (end < today) {
        return res.status(400).json({
          success: false,
          message: 'End date cannot be in the past. Please select today or a future date.'
        });
      }

      if (end < start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be on or after start date'
        });
      }

      // Validate times if both are provided and dates are the same
      if (startTime && endTime && startDate === endDate) {
        if (endTime <= startTime) {
          return res.status(400).json({
            success: false,
            message: 'End time must be after start time for same-day events'
          });
        }
      }

      // Create event
      const event = await Event.create({
        title: title.trim(),
        description: description?.trim() || '',
        eventType,
        startDate,
        endDate,
        startTime: startTime || null,
        endTime: endTime || null,
        location: location?.trim() || '',
        targetAudience: targetAudience || 'all',
        color: color || 'blue',
        isPublic: true,
        createdBy: userId
      });

      const populatedEvent = await Event.findById(event._id)
        .populate('createdBy', 'firstName lastName');

      return res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: populatedEvent
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Events API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
