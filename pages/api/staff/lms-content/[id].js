import connectDB from '../../../../lib/mongodb';
import LMSContent from '../../../../models/LMSContent';
import Staff from '../../../../models/Staff';
import User from '../../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    await connectDB();

    // Verify staff authentication
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
    
    if (!user || user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
    }

    // Find staff profile
    const staff = await Staff.findOne({ user: userId });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // DELETE - Delete content
    if (req.method === 'DELETE') {
      const content = await LMSContent.findById(id);
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Verify staff owns this content
      if (content.uploadedBy.toString() !== staff._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete content you uploaded'
        });
      }

      await LMSContent.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Content deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });

  } catch (error) {
    console.error('LMS Content API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

