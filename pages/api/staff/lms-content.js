import connectDB from '../../../lib/mongodb';
import LMSContent from '../../../models/LMSContent';
import Staff from '../../../models/Staff';
import Class from '../../../models/Class';
import Subject from '../../../models/Subject';
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
        .populate('subject', 'name code')
        .populate('class', 'name')
        .sort({ createdAt: -1 });

      // Return with class name and subject name for display
      const contentsWithDetails = contents.map(content => ({
        ...content.toObject(),
        className: content.class?.name || content.classId,
        subjectName: content.subject?.name || content.subjectName || 'Subject'
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

      // Comprehensive validation
      const validationErrors = [];
      
      if (!title || !title.trim()) {
        validationErrors.push('Title is required');
      } else if (title.trim().length < 3) {
        validationErrors.push('Title must be at least 3 characters');
      } else if (title.trim().length > 200) {
        validationErrors.push('Title must be less than 200 characters');
      }

      if (description && description.length > 500) {
        validationErrors.push('Description must be less than 500 characters');
      }

      if (!contentType) {
        validationErrors.push('Content type is required');
      } else {
        const validTypes = ['video', 'document', 'pdf', 'presentation', 'quiz', 'assignment', 'link', 'other'];
        if (!validTypes.includes(contentType)) {
          validationErrors.push('Invalid content type');
        }
      }

      if (!category) {
        validationErrors.push('Category is required');
      } else {
        const validCategories = ['lesson', 'assignment', 'study_material', 'reference', 'exam_preparation'];
        if (!validCategories.includes(category)) {
          validationErrors.push('Invalid category');
        }
      }

      if (!classId) {
        validationErrors.push('Class is required');
      }

      if (!subjectName || !subjectName.trim()) {
        validationErrors.push('Subject is required');
      } else if (subjectName.trim().length < 2) {
        validationErrors.push('Subject name must be at least 2 characters');
      }

      // Validate external link if provided
      if (externalLink && externalLink.trim()) {
        try {
          new URL(externalLink);
        } catch {
          validationErrors.push('Invalid URL format for external link');
        }
      }

      // Validate that content is provided (either link or file)
      if (contentType === 'link' && (!externalLink || !externalLink.trim())) {
        validationErrors.push('External link is required for link type content');
      }
      if (contentType !== 'link' && (!externalLink || !externalLink.trim())) {
        validationErrors.push('File URL is required for non-link content types');
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join('. '),
          errors: validationErrors
        });
      }

      // Check if class exists (if classId looks like an ObjectId)
      if (classId.match(/^[0-9a-fA-F]{24}$/)) {
        const classExists = await Class.findById(classId);
        if (!classExists) {
          return res.status(404).json({
            success: false,
            message: 'Class not found'
          });
        }
      }

      // Check for duplicate content (same title + class + subject)
      const duplicateContent = await LMSContent.findOne({
        title: title.trim(),
        classId: classId,
        subjectName: subjectName.trim(),
        uploadedBy: staff._id,
        isActive: true
      });

      if (duplicateContent) {
        return res.status(400).json({
          success: false,
          message: 'Content with this title already exists for this class and subject. Please use a different title or edit the existing content.'
        });
      }

      // Create content
      const contentData = {
        title: title.trim(),
        description: description ? description.trim() : '',
        contentType,
        category,
        classId: classId,
        subjectName: subjectName.trim(),
        tags: Array.isArray(tags) ? tags.filter(t => t && t.trim()).map(t => t.trim()) : [],
        uploadedBy: staff._id,
        isActive: true,
        publishDate: new Date()
      };

      // Add externalLink/fileUrl based on content type
      if (contentType === 'link') {
        contentData.externalLink = externalLink.trim();
      } else {
        contentData.fileUrl = externalLink.trim();
        contentData.externalLink = externalLink.trim();
      }

      const newContent = await LMSContent.create(contentData);

      // Populate the created content
      const populatedContent = await LMSContent.findById(newContent._id)
        .populate('subject', 'name code')
        .populate('class', 'name');

      return res.status(201).json({
        success: true,
        message: `Content "${title.trim()}" uploaded successfully for ${classId}`,
        data: populatedContent
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
