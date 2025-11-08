import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaChartLine, FaPlus, FaTimes, FaSave, FaSpinner, FaGraduationCap,
  FaExclamationTriangle, FaInfoCircle, FaSearch, FaFilter, FaCheckCircle,
  FaTimesCircle, FaCalendarAlt, FaPercentage, FaTrophy, FaBook
} from 'react-icons/fa';

export default function AddGrades() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamType, setFilterExamType] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const currentYear = new Date().getFullYear();
  const academicYears = useMemo(() => {
    const years = [];
    for (let i = currentYear - 1; i <= currentYear + 1; i++) {
      years.push(i.toString());
    }
    return years;
  }, [currentYear]);

  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    subjectId: '',
    examType: '',
    examDate: new Date().toISOString().split('T')[0],
    academicYear: currentYear.toString(),
    maxMarks: '100',
    marksObtained: '',
    remarks: ''
  });

  const examTypes = useMemo(() => [
    'Unit Test',
    'Mid Term',
    'Final',
    'Quarterly',
    'Half Yearly',
    'Annual',
    'Assignment',
    'Project',
    'Quiz'
  ], []);

  useEffect(() => {
    if (token) {
      fetchGrades();
      fetchMyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    filterGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grades, searchTerm, filterExamType, filterSubject]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/grades', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrades(response.data.data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyData = async () => {
    try {
      // Fetch staff dashboard to get classes and subjects
      const dashboardRes = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const schedule = dashboardRes.data.data?.todaySchedule || [];
      setClasses(schedule);

      // Fetch students from your assigned classes
      const studentsRes = await axios.get('/api/staff/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(studentsRes.data.students || studentsRes.data.data || []);

      // Fetch subjects from API
      const subjectsRes = await axios.get('/api/staff/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load classes and students');
    }
  };

  const filterGrades = useCallback(() => {
    let filtered = [...grades];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(grade => {
        const studentName = `${grade.student?.user?.firstName} ${grade.student?.user?.lastName}`.toLowerCase();
        const subjectName = grade.subject?.name?.toLowerCase() || '';
        return studentName.includes(searchTerm.toLowerCase()) || 
               subjectName.includes(searchTerm.toLowerCase());
      });
    }

    // Exam type filter
    if (filterExamType) {
      filtered = filtered.filter(grade => grade.examType === filterExamType);
    }

    // Subject filter
    if (filterSubject) {
      filtered = filtered.filter(grade => grade.subject?._id === filterSubject);
    }

    setFilteredGrades(filtered);
  }, [grades, searchTerm, filterExamType, filterSubject]);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'studentId':
        if (!value) return 'Student is required';
        return '';
      case 'subjectId':
        if (!value) return 'Subject is required';
        return '';
      case 'examType':
        if (!value) return 'Exam type is required';
        return '';
      case 'examDate':
        if (!value) return 'Exam date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) return 'Exam date cannot be in the future';
        return '';
      case 'academicYear':
        if (!value) return 'Academic year is required';
        return '';
      case 'maxMarks':
        if (!value) return 'Max marks is required';
        if (parseFloat(value) <= 0) return 'Max marks must be greater than 0';
        if (parseFloat(value) > 1000) return 'Max marks seems too high (max 1000)';
        return '';
      case 'marksObtained':
        if (value === '') return 'Marks obtained is required';
        if (parseFloat(value) < 0) return 'Cannot be negative';
        if (parseFloat(value) > parseFloat(formData.maxMarks)) return 'Cannot exceed max marks';
        return '';
      default:
        return '';
    }
  }, [formData.maxMarks]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.studentId) errors.studentId = 'Student is required';
    if (!formData.subjectId) errors.subjectId = 'Subject is required';
    if (!formData.examType) errors.examType = 'Exam type is required';
    if (!formData.examDate) errors.examDate = 'Exam date is required';
    if (!formData.academicYear) errors.academicYear = 'Academic year is required';
    
    if (!formData.maxMarks || parseFloat(formData.maxMarks) <= 0) {
      errors.maxMarks = 'Max marks must be greater than 0';
    }
    if (parseFloat(formData.maxMarks) > 1000) {
      errors.maxMarks = 'Max marks seems too high (max 1000)';
    }
    
    if (formData.marksObtained === '' || parseFloat(formData.marksObtained) < 0) {
      errors.marksObtained = 'Marks obtained is required and cannot be negative';
    }
    if (parseFloat(formData.marksObtained) > parseFloat(formData.maxMarks)) {
      errors.marksObtained = 'Marks obtained cannot exceed max marks';
    }

    // Check exam date
    const selectedDate = new Date(formData.examDate);
    const today = new Date();
    if (selectedDate > today) {
      errors.examDate = 'Exam date cannot be in the future';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-populate class when student is selected
    if (name === 'studentId' && value) {
      const student = students.find(s => s._id === value);
      if (student?.class?._id) {
        setFormData(prev => ({ ...prev, classId: student.class._id }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // Get student's class
      const student = students.find(s => s._id === formData.studentId);
      const classId = student?.class?._id;

      if (!classId) {
        toast.error('Student must be enrolled in a class');
        setSubmitting(false);
        return;
      }

      await axios.post('/api/staff/grades', {
        ...formData,
        classId,
        maxMarks: parseFloat(formData.maxMarks),
        marksObtained: parseFloat(formData.marksObtained)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Grade added successfully!', {
        duration: 4000,
        icon: '🎉',
      });
      
      setShowModal(false);
      resetForm();
      fetchGrades();
    } catch (error) {
      console.error('Error adding grade:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add grade';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      classId: '',
      subjectId: '',
      examType: '',
      examDate: new Date().toISOString().split('T')[0],
      academicYear: currentYear.toString(),
      maxMarks: '100',
      marksObtained: '',
      remarks: ''
    });
    setFieldErrors({});
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'D':
      case 'E':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'F':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const calculatePercentage = (obtained, total) => {
    return ((obtained / total) * 100).toFixed(2);
  };

  const hasErrors = Object.keys(fieldErrors).length > 0;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Loading grades data...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl">
                  <FaChartLine className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-black">
                    Add Grades
                  </h1>
                  <p className="text-green-100 font-semibold">Record student grades and examination marks</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <FaPlus />
                Add Grade
              </button>
            </div>
          </div>

          {/* Required Fields Info */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Required Information</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• <strong>Student</strong> - Select the student from your assigned classes</li>
                  <li>• <strong>Subject</strong> - Choose the subject for which you&apos;re adding grades</li>
                  <li>• <strong>Exam Type</strong> - Select the type of examination or assessment</li>
                  <li>• <strong>Exam Date</strong> - Date when the exam was conducted (cannot be future date)</li>
                  <li>• <strong>Academic Year</strong> - Year for which this grade is recorded</li>
                  <li>• <strong>Max Marks & Marks Obtained</strong> - Total marks and marks scored by student</li>
                  <li className="text-amber-700 italic">• Grade and percentage are calculated automatically</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Grading System</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>
                    <p className="font-semibold mb-1">Grade Scale:</p>
                    <ul className="space-y-1">
                      <li>• A+ (90-100%) - Outstanding</li>
                      <li>• A (80-89%) - Excellent</li>
                      <li>• B+ (70-79%) - Very Good</li>
                      <li>• B (60-69%) - Good</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Continued:</p>
                    <ul className="space-y-1">
                      <li>• C+ (50-59%) - Average</li>
                      <li>• C (40-49%) - Below Average</li>
                      <li>• D (33-39%) - Pass</li>
                      <li>• E (25-32%) - Needs Improvement</li>
                      <li>• F (&lt;25%) - Fail</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {grades.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaBook className="text-2xl" />
                  <span className="text-3xl font-black">{grades.length}</span>
                </div>
                <p className="font-bold">Total Grades</p>
                <p className="text-green-100 text-sm">Recorded</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaCheckCircle className="text-2xl" />
                  <span className="text-3xl font-black">
                    {grades.filter(g => g.isPassed).length}
                  </span>
                </div>
                <p className="font-bold">Passed</p>
                <p className="text-blue-100 text-sm">
                  {grades.length > 0 ? ((grades.filter(g => g.isPassed).length / grades.length) * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaTimesCircle className="text-2xl" />
                  <span className="text-3xl font-black">
                    {grades.filter(g => !g.isPassed).length}
                  </span>
                </div>
                <p className="font-bold">Failed</p>
                <p className="text-red-100 text-sm">
                  {grades.length > 0 ? ((grades.filter(g => !g.isPassed).length / grades.length) * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaPercentage className="text-2xl" />
                  <span className="text-3xl font-black">
                    {grades.length > 0 ? (grades.reduce((acc, g) => acc + (g.percentage || 0), 0) / grades.length).toFixed(1) : 0}%
                  </span>
                </div>
                <p className="font-bold">Avg Score</p>
                <p className="text-purple-100 text-sm">Overall</p>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          {grades.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-gray-500" />
                <h3 className="text-lg font-black">Search & Filter</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                  />
                </div>
                <select
                  value={filterExamType}
                  onChange={(e) => setFilterExamType(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                >
                  <option value="">All Exam Types</option>
                  {examTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              {(searchTerm || filterExamType || filterSubject) && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredGrades.length} of {grades.length} grades
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterExamType('');
                      setFilterSubject('');
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Grades List */}
          {grades.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grades Added Yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first grade entry</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus />
                Add First Grade
              </button>
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterExamType('');
                  setFilterSubject('');
                }}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">#</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Class</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Exam Type</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Exam Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Marks</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">%</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Grade</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {filteredGrades.map((grade, index) => (
                      <tr key={grade._id} className="hover:bg-green-50 transition-all">
                        <td className="px-6 py-4 text-gray-500 font-semibold">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">
                              {grade.student?.user?.firstName} {grade.student?.user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {grade.student?.admissionNumber}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                          {grade.class?.name}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                          {grade.subject?.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                            {grade.examType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(grade.examDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">
                            {grade.marksObtained}/{grade.totalMarks}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-purple-600">
                            {calculatePercentage(grade.marksObtained, grade.totalMarks)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 border-2 rounded-lg font-black ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {grade.isPassed ? (
                            <span className="flex items-center gap-1 text-green-600 font-bold text-sm">
                              <FaCheckCircle />
                              Pass
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 font-bold text-sm">
                              <FaTimesCircle />
                              Fail
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Grade Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 my-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaChartLine className="text-green-600 text-xl" />
                  </div>
                  <h2 className="text-3xl font-black text-green-600">Add Grade</h2>
                </div>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-red-500 transition-all"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                      fieldErrors.studentId 
                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : formData.studentId
                          ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                          : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                    }`}
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.user?.firstName} {student.user?.lastName} ({student.admissionNumber}) - {student.class?.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.studentId && (
                    <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                      <FaExclamationTriangle />
                      {fieldErrors.studentId}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.subjectId 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : formData.subjectId
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                            : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.subjectId && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.subjectId}
                      </p>
                    )}
                  </div>

                  {/* Exam Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Exam Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="examType"
                      value={formData.examType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.examType 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : formData.examType
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                            : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                    >
                      <option value="">-- Select Type --</option>
                      {examTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {fieldErrors.examType && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.examType}
                      </p>
                    )}
                  </div>

                  {/* Exam Date */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Exam Date <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      fieldErrors.examDate 
                        ? 'border-red-500 bg-red-50' 
                        : formData.examDate
                          ? 'border-green-500 bg-green-50'
                          : 'border-orange-300 bg-orange-50'
                    }`}>
                      <FaCalendarAlt className={fieldErrors.examDate ? 'text-red-500' : 'text-green-600'} />
                      <input
                        type="date"
                        name="examDate"
                        value={formData.examDate}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="bg-transparent font-bold focus:outline-none w-full"
                      />
                    </div>
                    {fieldErrors.examDate && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.examDate}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">Cannot be a future date</p>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Academic Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.academicYear 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                      }`}
                    >
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {fieldErrors.academicYear && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.academicYear}
                      </p>
                    )}
                  </div>

                  {/* Max Marks */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Max Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxMarks"
                      value={formData.maxMarks}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.maxMarks 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : formData.maxMarks
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                            : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                      placeholder="e.g., 100"
                      min="1"
                      max="1000"
                      step="0.01"
                    />
                    {fieldErrors.maxMarks && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.maxMarks}
                      </p>
                    )}
                  </div>

                  {/* Marks Obtained */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Marks Obtained <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="marksObtained"
                      value={formData.marksObtained}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.marksObtained 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : formData.marksObtained !== ''
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                            : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                      placeholder="e.g., 85"
                      min="0"
                      max={formData.maxMarks}
                      step="0.01"
                    />
                    {fieldErrors.marksObtained && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.marksObtained}
                      </p>
                    )}
                    {formData.marksObtained && formData.maxMarks && (
                      <p className="text-purple-600 text-sm mt-1 font-semibold">
                        Percentage: {calculatePercentage(formData.marksObtained, formData.maxMarks)}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none transition-all"
                    rows="2"
                    maxLength="200"
                    placeholder="Add any notes about this grade..."
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {formData.remarks.length}/200 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || hasErrors}
                    className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Grade
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
