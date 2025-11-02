const mongoose = require('mongoose');

const lmsContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['video', 'document', 'pdf', 'presentation', 'quiz', 'assignment', 'link', 'other']
  },
  category: {
    type: String,
    enum: ['lesson', 'assignment', 'study_material', 'reference', 'exam_preparation'],
    default: 'lesson'
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.contentType !== 'link';
    }
  },
  externalLink: {
    type: String,
    required: function() {
      return this.contentType === 'link';
    }
  },
  thumbnailUrl: {
    type: String
  },
  fileSize: {
    type: Number // In bytes
  },
  duration: {
    type: Number // In minutes (for videos)
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0
  },
  studentAccess: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    accessedAt: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  // For assignments
  assignment: {
    dueDate: Date,
    maxMarks: Number,
    submissions: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      submittedAt: Date,
      fileUrl: String,
      remarks: String,
      marksObtained: Number,
      evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      },
      evaluatedAt: Date
    }]
  }
}, {
  timestamps: true
});

// Indexes
lmsContentSchema.index({ class: 1, subject: 1 });
lmsContentSchema.index({ uploadedBy: 1 });
lmsContentSchema.index({ contentType: 1 });

module.exports = mongoose.model('LMSContent', lmsContentSchema);

