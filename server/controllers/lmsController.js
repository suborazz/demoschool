const LMSContent = require('../models/LMSContent');
const Staff = require('../models/Staff');

// @desc    Upload file
// @route   POST /api/lms/upload
// @access  Private/Admin/Staff
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // In production, upload to cloud storage (Cloudinary/S3)
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
};

// @desc    Create LMS content
// @route   POST /api/lms/content
// @access  Private/Admin/Staff
exports.createContent = async (req, res) => {
  try {
    // Get staff ID if the user is staff
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      if (staff) {
        req.body.uploadedBy = staff._id;
      }
    }

    const content = await LMSContent.create(req.body);
    await content.populate('class subject uploadedBy');

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating content'
    });
  }
};

// @desc    Get all LMS content
// @route   GET /api/lms/content
// @access  Private
exports.getAllContent = async (req, res) => {
  try {
    const { class: classId, subject, contentType, category } = req.query;
    const filter = { isActive: true };
    
    if (classId) filter.class = classId;
    if (subject) filter.subject = subject;
    if (contentType) filter.contentType = contentType;
    if (category) filter.category = category;

    const content = await LMSContent.find(filter)
      .populate('class', 'name grade')
      .populate('subject', 'name code')
      .populate('uploadedBy', 'user')
      .populate({
        path: 'uploadedBy',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort({ publishDate: -1 });

    res.json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content'
    });
  }
};

// @desc    Get LMS content by ID
// @route   GET /api/lms/content/:id
// @access  Private
exports.getContentById = async (req, res) => {
  try {
    const content = await LMSContent.findById(req.params.id)
      .populate('class subject uploadedBy')
      .populate({
        path: 'assignment.submissions.student',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content'
    });
  }
};

// @desc    Update LMS content
// @route   PUT /api/lms/content/:id
// @access  Private/Admin/Staff
exports.updateContent = async (req, res) => {
  try {
    const content = await LMSContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('class subject uploadedBy');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content'
    });
  }
};

// @desc    Delete LMS content
// @route   DELETE /api/lms/content/:id
// @access  Private/Admin/Staff
exports.deleteContent = async (req, res) => {
  try {
    const content = await LMSContent.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content'
    });
  }
};

// @desc    Evaluate assignment submission
// @route   PUT /api/lms/content/:contentId/evaluate/:submissionId
// @access  Private/Admin/Staff
exports.evaluateAssignment = async (req, res) => {
  try {
    const { contentId, submissionId } = req.params;
    const { marksObtained, remarks } = req.body;

    const content = await LMSContent.findById(contentId);

    if (!content || content.category !== 'assignment') {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const submission = content.assignment.submissions.id(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get staff ID
    let evaluatorId;
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      evaluatorId = staff?._id;
    }

    submission.marksObtained = marksObtained;
    submission.remarks = remarks;
    submission.evaluatedBy = evaluatorId;
    submission.evaluatedAt = new Date();

    await content.save();

    res.json({
      success: true,
      message: 'Assignment evaluated successfully',
      data: content
    });
  } catch (error) {
    console.error('Evaluate assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error evaluating assignment'
    });
  }
};

