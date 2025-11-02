const Notification = require('../models/Notification');

// @desc    Get school information
// @route   GET /api/public/school-info
// @access  Public
exports.getSchoolInfo = async (req, res) => {
  try {
    const schoolInfo = {
      name: process.env.SCHOOL_NAME || 'DAV School',
      phone: process.env.SCHOOL_PHONE || '+91 7488770476',
      email: process.env.SCHOOL_EMAIL || 'info@davschool.edu.in',
      address: process.env.SCHOOL_ADDRESS || 'India',
      about: 'DAV School is committed to providing quality education and holistic development of students.',
      mission: 'To provide excellence in education and create responsible citizens.',
      vision: 'To be a leading educational institution recognized for academic excellence and character building.',
      facilities: [
        'Smart Classrooms',
        'Computer Labs',
        'Science Laboratories',
        'Library',
        'Sports Complex',
        'Auditorium',
        'Transportation',
        'Cafeteria'
      ],
      achievements: [
        '100% Pass Rate in Board Exams',
        'Multiple State Level Sports Championships',
        'Excellence in Science and Mathematics',
        'Active Community Service Programs'
      ]
    };

    res.json({
      success: true,
      data: schoolInfo
    });
  } catch (error) {
    console.error('Get school info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching school information'
    });
  }
};

// @desc    Submit contact form
// @route   POST /api/public/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // In production, save to database or send email
    console.log('Contact form submission:', { name, email, phone, subject, message });

    // You can create a Contact model and save it
    // Or send an email to admin

    res.json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.'
    });
  } catch (error) {
    console.error('Submit contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form'
    });
  }
};

// @desc    Submit admission inquiry
// @route   POST /api/public/admission-inquiry
// @access  Public
exports.submitAdmissionInquiry = async (req, res) => {
  try {
    const { 
      studentName, 
      dateOfBirth, 
      grade, 
      parentName, 
      email, 
      phone, 
      address,
      previousSchool,
      message 
    } = req.body;

    // In production, save to database or send email
    console.log('Admission inquiry:', { 
      studentName, 
      dateOfBirth, 
      grade, 
      parentName, 
      email, 
      phone, 
      address,
      previousSchool,
      message 
    });

    res.json({
      success: true,
      message: 'Your admission inquiry has been submitted successfully. Our team will contact you soon.'
    });
  } catch (error) {
    console.error('Submit admission inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting admission inquiry'
    });
  }
};

// @desc    Get gallery images
// @route   GET /api/public/gallery
// @access  Public
exports.getGallery = async (req, res) => {
  try {
    // In production, fetch from database
    const galleryImages = [
      {
        id: 1,
        title: 'Annual Day Celebration',
        category: 'Events',
        imageUrl: '/images/gallery/annual-day.jpg',
        date: new Date('2024-03-15')
      },
      {
        id: 2,
        title: 'Sports Day',
        category: 'Sports',
        imageUrl: '/images/gallery/sports-day.jpg',
        date: new Date('2024-02-20')
      },
      {
        id: 3,
        title: 'Science Exhibition',
        category: 'Academic',
        imageUrl: '/images/gallery/science-exhibition.jpg',
        date: new Date('2024-01-10')
      }
    ];

    res.json({
      success: true,
      count: galleryImages.length,
      data: galleryImages
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery'
    });
  }
};

// @desc    Get public announcements
// @route   GET /api/public/announcements
// @access  Public
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Notification.find({
      recipients: 'all',
      type: 'announcement',
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title message createdAt');

    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements'
    });
  }
};

