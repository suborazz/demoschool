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
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Notification title is required'
        });
      }

      if (title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Title must be at least 3 characters'
        });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      if (message.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Message must be at least 10 characters'
        });
      }

      const validTypes = ['announcement', 'event', 'fee', 'grade', 'attendance', 'leave', 'general', 'urgent'];
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification type'
        });
      }

      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority level'
        });
      }

      const validRecipients = ['all', 'admin', 'staff', 'parents', 'students'];
      if (!recipients || !validRecipients.includes(recipients)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recipients selection'
        });
      }

      // Create notification
      const newNotification = await Notification.create({
        title: title.trim(),
        message: message.trim(),
        type: type || 'general',
        priority: priority || 'medium',
        recipients,
        specificRecipients: specificRecipients || [],
        createdBy: userId,
        isActive: true
      });

      const populatedNotification = await Notification.findById(newNotification._id)
        .populate('createdBy', 'firstName lastName');

      return res.status(201).json({
        success: true,
        message: `Notification sent successfully to ${recipients}`,
        data: populatedNotification
      });
    }

    // DELETE - Delete notification
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Notification ID is required'
        });
      }

      await Notification.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Notification deleted successfully'
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

