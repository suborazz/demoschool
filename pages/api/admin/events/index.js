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
      const events = await Event.find().sort({ startDate: 1 });
      
      return res.json({
        success: true,
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
      if (!title || !eventType || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Title, event type, start date, and end date are required'
        });
      }

      // Create event
      const event = await Event.create({
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
        createdBy: userId
      });

      return res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
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
