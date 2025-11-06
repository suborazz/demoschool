import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaChartLine, FaPlus, FaTimes, FaSave, FaSpinner, FaGraduationCap
} from 'react-icons/fa';

export default function AddGrades() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    subjectId: '',
    examType: '',
    maxMarks: '100',
    marksObtained: '',
    remarks: ''
  });

  useEffect(() => {
    if (token) {
      fetchGrades();
      fetchMyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

      // Fetch all students
      const studentsRes = await axios.get('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(studentsRes.data.students || studentsRes.data.data || []);

      // Fetch subjects (would need subject API, for now use from schedule)
      // For simplicity, extract unique subjects from schedule
      const uniqueSubjects = [...new Set(schedule.map(s => s.subject))];
      setSubjects(uniqueSubjects.map((name, idx) => ({ _id: `sub${idx}`, name })));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load classes and students');
    }
  };

  const validateField = (name, value) => {
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
      case 'maxMarks':
        if (!value) return 'Max marks is required';
        if (value <= 0) return 'Max marks must be greater than 0';
        if (value > 1000) return 'Max marks seems too high (max 1000)';
        return '';
      case 'marksObtained':
        if (value === '') return 'Marks obtained is required';
        if (value < 0) return 'Cannot be negative';
        if (parseFloat(value) > parseFloat(formData.maxMarks)) return 'Cannot exceed max marks';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.studentId) errors.push('Student is required');
    if (!formData.subjectId) errors.push('Subject is required');
    if (!formData.examType) errors.push('Exam type is required');
    if (!formData.maxMarks || formData.maxMarks <= 0) errors.push('Max marks must be greater than 0');
    if (formData.marksObtained === '' || formData.marksObtained < 0) errors.push('Marks obtained is required');
    if (parseFloat(formData.marksObtained) > parseFloat(formData.maxMarks)) errors.push('Marks obtained cannot exceed max marks');
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('. '));
      setSubmitting(false);
      return;
    }

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

      toast.success('Grade added successfully!');
      setShowModal(false);
      resetForm();
      fetchGrades();
    } catch (error) {
      console.error('Error adding grade:', error);
      toast.error(error.response?.data?.message || 'Failed to add grade');
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
      maxMarks: '100',
      marksObtained: '',
      remarks: ''
    });
    setFieldErrors({});
    setError('');
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-green-600 animate-spin" />
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-green-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaChartLine className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Add Grades
                  </h1>
                  <p className="text-gray-600 font-semibold">Record student grades and marks</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus />
                Add Grade
              </button>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-2xl">✅</span>
              <p className="text-green-700 font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-2xl">❌</span>
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

          {/* Grades List */}
          {grades.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grades Added Yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first grade</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus />
                Add First Grade
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Exam Type</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Marks</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-green-900 uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {grades.map((grade) => (
                    <tr key={grade._id} className="hover:bg-green-50">
                      <td className="px-6 py-4 font-bold">{grade.student?.user?.firstName} {grade.student?.user?.lastName}</td>
                      <td className="px-6 py-4">{grade.subject?.name}</td>
                      <td className="px-6 py-4">{grade.examType}</td>
                      <td className="px-6 py-4">{grade.marksObtained}/{grade.maxMarks}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold">
                          {grade.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Grade Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-green-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-green-600">Add Grade</h2>
                <button onClick={() => { setShowModal(false); resetForm(); }}>
                  <FaTimes size={24} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3">
                    <span>⚠️</span>
                    <p className="text-red-700 font-bold">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Student <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.studentId 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
                      }`}
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.user?.firstName} {student.user?.lastName} ({student.admissionNumber})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.studentId && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.studentId}
                      </p>
                    )}
                  </div>
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
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
                      }`}
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>{subject.name}</option>
                      ))}
                    </select>
                    {fieldErrors.subjectId && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.subjectId}
                      </p>
                    )}
                  </div>
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
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
                      }`}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Unit Test">Unit Test</option>
                      <option value="Mid-term">Mid-term</option>
                      <option value="Final">Final Exam</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Project">Project</option>
                      <option value="Quiz">Quiz</option>
                    </select>
                    {fieldErrors.examType && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.examType}
                      </p>
                    )}
                  </div>
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
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
                      }`}
                      placeholder="e.g., 100"
                      min="1"
                      max="1000"
                      required
                    />
                    {fieldErrors.maxMarks && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.maxMarks}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Marks Obtained <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="marksObtained"
                      value={formData.marksObtained}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.marksObtained 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
                      }`}
                      min="0"
                      max={formData.maxMarks}
                      required
                    />
                    {fieldErrors.marksObtained && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {fieldErrors.marksObtained}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl disabled:opacity-50"
                  >
                    {submitting ? <><FaSpinner className="animate-spin" />Saving...</> : <><FaSave />Save Grade</>}
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

