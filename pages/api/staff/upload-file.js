import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
    
    if (!user || user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'lms-content');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parse form data
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filename: (name, ext, part) => {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${uniqueSuffix}${ext}`;
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'File upload failed',
          error: err.message 
        });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      // Get the first file if it's an array
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      
      // Generate public URL
      const fileUrl = `/uploads/lms-content/${path.basename(uploadedFile.filepath)}`;
      
      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        fileUrl,
        fileName: uploadedFile.originalFilename,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimetype
      });
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}



