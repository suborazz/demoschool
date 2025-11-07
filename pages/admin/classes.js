import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  FaSchool, FaPlus, FaUsers, FaChalkboardTeacher, FaBook, 
  FaEdit, FaTrash, FaTimes, FaSave, FaSpinner 
} from 'react-icons/fa';

export default function ClassesManagement() {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: 'A',
    academicYear: new Date().getFullYear().toString(),
    capacity: 40,
    room: '',
    classTeacher: ''
  });

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(error.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch staff list
  const fetchStaff = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const staffData = response.data.data || response.data.staff || [];
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff list');
    }
  }, [token]);

  // Fetch classes and staff
  useEffect(() => {
    if (token) {
      fetchClasses();
      fetchStaff();
    }
  }, [token, fetchClasses, fetchStaff]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Class name is required';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        return '';
      case 'grade':
        if (!value) return 'Grade is required';
        if (value < 1 || value > 12) return 'Grade must be between 1 and 12';
        return '';
      case 'capacity':
        if (value < 1) return 'Capacity must be at least 1';
        return '';
      case 'room':
        // Room is optional, no validation needed
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validate field in real-time
    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Class name is required');
    if (formData.name.trim().length < 2) errors.push('Class name must be at least 2 characters');
    if (!formData.grade) errors.push('Grade is required');
    if (formData.grade < 1 || formData.grade > 12) errors.push('Grade must be between 1 and 12');
    if (formData.capacity < 1) errors.push('Capacity must be at least 1');

    return errors;
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
      console.log('Submitting class data:', formData);
      
      const response = await axios.post('/api/admin/classes', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Class created:', response.data);
      toast.success('Class added successfully!');
      setShowModal(false);
      resetForm();
      fetchClasses();
    } catch (error) {
      console.error('Error adding class:', error);
      toast.error(error.response?.data?.message || 'Failed to add class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
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
      console.log('Updating class ID:', editingClass._id);
      console.log('Sending update data:', formData);
      
      const response = await axios.put(`/api/admin/classes/${editingClass._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Class updated:', response.data);
      toast.success('Class updated successfully!');
      setShowEditModal(false);
      setEditingClass(null);
      resetForm();
      fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(error.response?.data?.message || 'Failed to update class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (classId) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      await axios.delete(`/api/admin/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Class deleted successfully!');
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error(error.response?.data?.message || 'Failed to delete class');
    }
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name || '',
      grade: cls.grade || '',
      section: cls.section || 'A',
      academicYear: cls.academicYear || new Date().getFullYear().toString(),
      capacity: cls.capacity || 40,
      room: cls.room || '',
      classTeacher: cls.classTeacher?._id || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      section: 'A',
      academicYear: new Date().getFullYear().toString(),
      capacity: 40,
      room: '',
      classTeacher: ''
    });
    setFieldErrors({});
    setError('');
  };

  // Calculate stats
  const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
  const totalSections = classes.reduce((sum, cls) => sum + (cls.sections?.length || 1), 0);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading classes...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-indigo-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <FaSchool className="text-white text-3xl sm:text-4xl" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Classes Management
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base font-semibold">
                    Manage classes, sections, and capacity
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <FaPlus />
                Add New Class
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <span className="text-2xl">✅</span>
              <p className="text-green-700 font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <span className="text-2xl">❌</span>
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaSchool className="text-3xl" />
                <span className="text-3xl font-black">{classes.length}</span>
              </div>
              <p className="font-bold opacity-90">Total Classes</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaUsers className="text-3xl" />
                <span className="text-3xl font-black">{totalStudents}</span>
              </div>
              <p className="font-bold opacity-90">Total Students</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaSchool className="text-3xl" />
                <span className="text-3xl font-black">{totalSections}</span>
              </div>
              <p className="font-bold opacity-90">Sections</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaBook className="text-3xl" />
                <span className="text-3xl font-black">{classes.reduce((sum, cls) => sum + (cls.capacity || 0), 0)}</span>
              </div>
              <p className="font-bold opacity-90">Total Capacity</p>
            </div>
          </div>

          {/* Classes Grid */}
          {classes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaSchool className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Classes Found</h3>
              <p className="text-gray-600 mb-6">Start by adding your first class</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <FaPlus />
                Add First Class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div key={cls._id} className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 hover:scale-105 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 mb-1">{cls.name}</h3>
                      <p className="text-gray-600 font-semibold">Grade {cls.grade} - Section {cls.section}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(cls)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(cls._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">Students:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                        {cls.studentCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">Capacity:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                        {cls.capacity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">Room:</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                        {cls.room || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">Academic Year:</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">
                        {cls.academicYear}
                      </span>
                    </div>
                    {cls.classTeacher && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                        <FaChalkboardTeacher className="text-indigo-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Class Teacher:</p>
                          <p className="text-sm font-bold text-gray-900">
                            {cls.classTeacher.user?.firstName} {cls.classTeacher.user?.lastName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Class Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-indigo-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-indigo-600">Add New Class</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-red-700 font-bold">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.name 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                      }`}
                      placeholder="e.g., Class 10-A"
                      required
                    />
                    {fieldErrors.name && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Grade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.grade 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                      }`}
                      placeholder="e.g., 10"
                      min="1"
                      max="12"
                      required
                    />
                    {fieldErrors.grade && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.grade}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Section
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
                    >
                      {['A', 'B', 'C', 'D', 'E'].map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.capacity 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                      }`}
                      placeholder="40"
                      min="1"
                      required
                    />
                    {fieldErrors.capacity && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.capacity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      name="room"
                      value={formData.room}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
                      placeholder="e.g., 101"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - Physical room number</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
                      placeholder="2024"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default: Current year</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <FaChalkboardTeacher className="inline mr-2 text-indigo-600" />
                      Class Teacher (Optional)
                    </label>
                    <select
                      name="classTeacher"
                      value={formData.classTeacher}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none font-semibold"
                    >
                      <option value="">Select Teacher</option>
                      {staff.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.user?.firstName} {teacher.user?.lastName} - {teacher.designation} ({teacher.employeeId})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Assign a class teacher who will be the primary contact for this class
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save Class</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Class Modal */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-blue-600">Edit Class</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingClass(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-red-700 font-bold">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Grade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      min="1"
                      max="12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Section
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    >
                      {['A', 'B', 'C', 'D', 'E'].map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      name="room"
                      value={formData.room}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <FaChalkboardTeacher className="inline mr-2 text-blue-600" />
                      Class Teacher (Optional)
                    </label>
                    <select
                      name="classTeacher"
                      value={formData.classTeacher}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none font-semibold"
                    >
                      <option value="">Select Teacher</option>
                      {staff.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.user?.firstName} {teacher.user?.lastName} - {teacher.designation} ({teacher.employeeId})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Assign a class teacher who will be the primary contact for this class
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingClass(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Update Class</span>
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
