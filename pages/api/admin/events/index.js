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

    // GET - Fetch all events
    if (req.method === 'GET') {
      const events = await Event.find()
        .populate('createdBy', 'firstName lastName')
        .populate('targetClasses')
        .sort({ startDate: 1 });

      return res.status(200).json({
        success: true,
        count: events.length,
        data: events
      });
    }

    // POST - Create new event
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
      const validationErrors = [];

      if (!title || !title.trim()) validationErrors.push('Event title is required');
      if (!eventType) validationErrors.push('Event type is required');
      if (!startDate) validationErrors.push('Start date is required');
      if (!endDate) validationErrors.push('End date is required');

      // Date validation
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        validationErrors.push('End date must be after start date');
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Create event
      const newEvent = await Event.create({
        title: title.trim(),
        description: description?.trim() || '',
        eventType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime: startTime || '',
        endTime: endTime || '',
        location: location?.trim() || '',
        targetAudience: targetAudience || 'all',
        color: color || 'blue',
        createdBy: userId
      });

      const populatedEvent = await Event.findById(newEvent._id)
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
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Events API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

