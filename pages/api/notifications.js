import connectDB from '../../lib/mongodb';
import Notification from '../../models/Notification';
import User from '../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Verify authentication
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

    // Fetch notifications based on user role
    const query = {
      isActive: true,
      $or: [
        { recipients: 'all' },
        { recipients: user.role }
      ]
    };

    // Don't show expired notifications
    const now = new Date();
    query.$or.push({
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    });

    const notifications = await Notification.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark which ones user has read
    const notificationsWithReadStatus = notifications.map(notif => {
      const hasRead = notif.readBy.some(r => r.user.toString() === userId);
      return {
        _id: notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        priority: notif.priority,
        recipients: notif.recipients,
        createdAt: notif.createdAt,
        createdBy: notif.createdBy,
        isRead: hasRead,
        readAt: hasRead ? notif.readBy.find(r => r.user.toString() === userId)?.readAt : null
      };
    });

    const unreadCount = notificationsWithReadStatus.filter(n => !n.isRead).length;

    return res.json({
      success: true,
      data: notificationsWithReadStatus,
      unreadCount
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

