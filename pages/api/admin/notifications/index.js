import connectDB from '../../../../lib/mongodb';
import Notification from '../../../../models/Notification';
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

    // GET - Fetch all notifications
    if (req.method === 'GET') {
      const notifications = await Notification.find()
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(50);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sentToday = await Notification.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      });

      const totalUsers = await User.countDocuments();

      return res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications,
        stats: {
          sentToday,
          totalUsers,
          totalNotifications: await Notification.countDocuments()
        }
      });
    }

    // POST - Create new notification
    if (req.method === 'POST') {
      const {
        title,
        message,
        type,
        priority,
        recipients,
        specificRecipients
      } = req.body;

      // Validation
      const validationErrors = [];

      if (!title || !title.trim()) validationErrors.push('Notification title is required');
      if (!message || !message.trim()) validationErrors.push('Message is required');
      if (!type) validationErrors.push('Type is required');
      if (!priority) validationErrors.push('Priority is required');
      if (!recipients) validationErrors.push('Recipients are required');

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Create notification
      const newNotification = await Notification.create({
        title: title.trim(),
        message: message.trim(),
        type,
        priority,
        recipients,
        specificRecipients: specificRecipients || [],
        createdBy: userId,
        isActive: true
      });

      const populatedNotification = await Notification.findById(newNotification._id)
        .populate('createdBy', 'firstName lastName');

      return res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: populatedNotification
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('Notifications API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

