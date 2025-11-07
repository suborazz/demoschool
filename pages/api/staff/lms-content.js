import connectDB from '../../../lib/mongodb';
import LMSContent from '../../../models/LMSContent';
import Staff from '../../../models/Staff';
import User from '../../../models/User';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
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

    // GET - Fetch all content uploaded by this staff
    if (req.method === 'GET') {
      const contents = await LMSContent.find({ uploadedBy: staff._id })
        .sort({ createdAt: -1 });

      // Return with class name and subject name for display
      const contentsWithDetails = contents.map(content => ({
        ...content.toObject(),
        className: content.class || content.classId,
        subjectName: content.subject || content.subjectName || 'Subject'
      }));

      return res.status(200).json({
        success: true,
        count: contents.length,
        data: contentsWithDetails
      });
    }

    // POST - Upload new content
    if (req.method === 'POST') {
      const {
        title,
        description,
        contentType,
        category,
        classId,
        subjectName,
        externalLink,
        tags
      } = req.body;

      // Validation
      const validationErrors = [];
      if (!title || !title.trim()) validationErrors.push('Title is required');
      if (!contentType) validationErrors.push('Content type is required');
      if (!category) validationErrors.push('Category is required');
      if (!classId) validationErrors.push('Class is required');
      if (!subjectName || !subjectName.trim()) validationErrors.push('Subject is required');

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. ')
        });
      }

      // Create content
      const contentData = {
        title: title.trim(),
        description: description ? description.trim() : '',
        contentType,
        category,
        classId: classId,
        subjectName: subjectName,
        tags: Array.isArray(tags) ? tags : [],
        uploadedBy: staff._id,
        isActive: true,
        publishDate: new Date()
      };

      // Add externalLink for link type
      if (contentType === 'link') {
        contentData.externalLink = externalLink.trim();
      } else {
        // For non-link types, provide a placeholder fileUrl
        // In a real scenario, you'd upload the file and get the URL
        contentData.fileUrl = externalLink && externalLink.trim() ? externalLink.trim() : 'pending-upload';
      }

      const newContent = await LMSContent.create(contentData);

      return res.status(201).json({
        success: true,
        message: 'Content uploaded successfully',
        data: newContent
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

