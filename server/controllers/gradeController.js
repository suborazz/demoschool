const Grade = require('../models/Grade');
const Staff = require('../models/Staff');

// @desc    Create grade
// @route   POST /api/grades
// @access  Private/Admin/Staff
exports.createGrade = async (req, res) => {
  try {
    // Get staff ID if the user is staff
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user.id });
      if (staff) {
        req.body.enteredBy = staff._id;
      }
    }

    const grade = await Grade.create(req.body);
    await grade.populate('student subject class enteredBy');

    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: grade
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating grade'
    });
  }
};

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private/Admin/Staff
exports.getAllGrades = async (req, res) => {
  try {
    const { student, class: classId, subject, academicYear, examType } = req.query;
    const filter = {};
    
    if (student) filter.student = student;
    if (classId) filter.class = classId;
    if (subject) filter.subject = subject;
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;

    const grades = await Grade.find(filter)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: '-password'
        }
      })
      .populate('class')
      .populate('subject')
      .populate('enteredBy')
      .sort({ examDate: -1 });

    res.json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
};

// @desc    Get grade by ID
// @route   GET /api/grades/:id
// @access  Private/Admin/Staff
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student class subject enteredBy');

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      data: grade
    });
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grade'
    });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private/Admin/Staff
exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student class subject enteredBy');

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: grade
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating grade'
    });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting grade'
    });
  }
};

// @desc    Get grades by student
// @route   GET /api/grades/student/:studentId
// @access  Private/Admin/Staff/Parent/Student
exports.getGradesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, examType } = req.query;

    const filter = { student: studentId };
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;

    const grades = await Grade.find(filter)
      .populate('subject', 'name code')
      .populate('class', 'name grade')
      .sort({ examDate: -1 });

    res.json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    console.error('Get grades by student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
};

// @desc    Get grades by class
// @route   GET /api/grades/class/:classId
// @access  Private/Admin/Staff
exports.getGradesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject, examType, academicYear } = req.query;

    const filter = { class: classId };
    if (subject) filter.subject = subject;
    if (examType) filter.examType = examType;
    if (academicYear) filter.academicYear = academicYear;

    const grades = await Grade.find(filter)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('subject', 'name code')
      .sort({ marksObtained: -1 });

    res.json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    console.error('Get grades by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
};

