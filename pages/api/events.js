import connectDB from '../../lib/mongodb';
import User from '../../models/User';
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
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Verify authentication (all logged-in users can view events)
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
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch events based on user role
    // Users can see events targeted to them or to "all"
    const query = {
      isPublic: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: user.role }
      ]
    };

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: 1 });

    // Filter upcoming events (today onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingEvents = events.filter(event => {
      const eventEnd = new Date(event.endDate);
      eventEnd.setHours(23, 59, 59, 999);
      return eventEnd >= today;
    });

    return res.json({
      success: true,
      count: upcomingEvents.length,
      data: upcomingEvents
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

