import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaBook, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSpinner 
} from 'react-icons/fa';

export default function SubjectsManagement() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'Core',
    totalMarks: 100,
    passingMarks: 33
  });

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSubjects();
    }
  }, [token, fetchSubjects]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Subject name is required';
        if (value.trim().length < 2) return 'Subject name must be at least 2 characters';
        if (value.trim().length > 100) return 'Subject name cannot exceed 100 characters';
        return '';
      
      case 'code':
        if (!value.trim()) return 'Subject code is required';
        if (value.trim().length < 2) return 'Code must be at least 2 characters';
        if (value.trim().length > 20) return 'Code cannot exceed 20 characters';
        if (!/^[A-Z0-9-_]+$/i.test(value.trim())) return 'Code can only contain letters, numbers, hyphens, and underscores';
        return '';
      
      case 'totalMarks':
        if (!value) return 'Total marks is required';
        if (value <= 0) return 'Total marks must be greater than 0';
        if (value > 1000) return 'Total marks cannot exceed 1000';
        return '';
      
      case 'passingMarks':
        if (!value && value !== 0) return 'Passing marks is required';
        if (value < 0) return 'Passing marks cannot be negative';
        if (parseInt(value) > parseInt(formData.totalMarks)) return 'Passing marks cannot exceed total marks';
        return '';
      
      case 'category':
        if (!value) return 'Category is required';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validate field in real-time
    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    const newFieldErrors = {};
    
    if (!formData.name.trim()) {
      errors.push('Subject name is required');
      newFieldErrors.name = 'Subject name is required';
    } else if (formData.name.trim().length < 2) {
      errors.push('Subject name must be at least 2 characters');
      newFieldErrors.name = 'Must be at least 2 characters';
    }
    
    if (!formData.code.trim()) {
      errors.push('Subject code is required');
      newFieldErrors.code = 'Subject code is required';
    } else if (formData.code.trim().length < 2) {
      errors.push('Code must be at least 2 characters');
      newFieldErrors.code = 'Must be at least 2 characters';
    } else if (!/^[A-Z0-9-_]+$/i.test(formData.code.trim())) {
      errors.push('Code can only contain letters, numbers, hyphens, and underscores');
      newFieldErrors.code = 'Only letters, numbers, -, _';
    }
    
    if (!formData.totalMarks || formData.totalMarks <= 0) {
      errors.push('Total marks must be greater than 0');
      newFieldErrors.totalMarks = 'Must be > 0';
    } else if (formData.totalMarks > 1000) {
      errors.push('Total marks cannot exceed 1000');
      newFieldErrors.totalMarks = 'Max 1000';
    }
    
    if (formData.passingMarks < 0) {
      errors.push('Passing marks cannot be negative');
      newFieldErrors.passingMarks = 'Cannot be negative';
    } else if (parseInt(formData.passingMarks) > parseInt(formData.totalMarks)) {
      errors.push('Passing marks cannot exceed total marks');
      newFieldErrors.passingMarks = 'Cannot exceed total marks';
    }
    
    if (!formData.category) {
      errors.push('Category is required');
      newFieldErrors.category = 'Category is required';
    }
    
    setFieldErrors(newFieldErrors);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors.join('. '));
      return;
    }

    setSubmitting(true);

    try {
      await axios.post('/api/admin/subjects', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Subject created successfully!');
      setShowModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error(error.response?.data?.message || 'Failed to create subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors.join('. '));
      return;
    }

    setSubmitting(true);

    try {
      await axios.put(`/api/admin/subjects/${editingSubject._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Subject updated successfully!');
      setShowEditModal(false);
      setEditingSubject(null);
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error(error.response?.data?.message || 'Failed to update subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (subjectId) => {
    if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) return;

    try {
      await axios.delete(`/api/admin/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Subject deleted successfully!');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    }
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || '',
      category: subject.category || 'Core',
      totalMarks: subject.totalMarks || 100,
      passingMarks: subject.passingMarks || 33
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'Core',
      totalMarks: 100,
      passingMarks: 33
    });
    setFieldErrors({});
  };

  const categories = ['Core', 'Elective', 'Language', 'Science', 'Arts', 'Sports', 'Co-curricular'];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading subjects...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaBook className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Subjects Management
                  </h1>
                  <p className="text-gray-600 font-semibold">Add and manage school subjects</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus />
                Add Subject
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaBook className="text-3xl" />
                <span className="text-3xl font-black">{subjects.length}</span>
              </div>
              <p className="font-bold">Total Subjects</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaBook className="text-3xl" />
                <span className="text-3xl font-black">{subjects.filter(s => s.isActive).length}</span>
              </div>
              <p className="font-bold">Active Subjects</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaBook className="text-3xl" />
                <span className="text-3xl font-black">{subjects.filter(s => !s.isActive).length}</span>
              </div>
              <p className="font-bold">Inactive Subjects</p>
            </div>
          </div>

          {/* Subjects List */}
          {subjects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Subjects Found</h3>
              <p className="text-gray-600 mb-6">Start by adding your first subject</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus />
                Add First Subject
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div key={subject._id} className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 hover:scale-105 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-black text-gray-900">{subject.name}</h3>
                        {!subject.isActive && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-semibold">Code: {subject.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(subject)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(subject._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  {subject.description && (
                    <p className="text-sm text-gray-600 mb-4">{subject.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">Category:</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                        {subject.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">Total Marks:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                        {subject.totalMarks}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">Passing Marks:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                        {subject.passingMarks}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Subject Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-indigo-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-indigo-600">Add New Subject</h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Required Fields Notice */}
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-indigo-800 mb-2">📋 Required Fields:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-indigo-700">
                    <div>✓ Subject Name (2-100 characters)</div>
                    <div>✓ Subject Code (2-20 alphanumeric)</div>
                    <div>✓ Category (Core, Elective, etc.)</div>
                    <div>✓ Total Marks (1-1000)</div>
                    <div>✓ Passing Marks (≤ Total Marks)</div>
                  </div>
                  <p className="text-xs text-indigo-600 mt-2">
                    💡 <span className="text-red-500">*</span> indicates required fields
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject Name <span className="text-red-500">*</span>
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
                      placeholder="e.g., Mathematics"
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
                      Subject Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none uppercase transition-all ${
                        fieldErrors.code 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                      }`}
                      placeholder="e.g., MATH101"
                      required
                    />
                    {fieldErrors.code && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.code}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Letters, numbers, -, _ only</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
                    rows="3"
                    placeholder="Brief description of the subject (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - Add subject details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.category 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                      }`}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {fieldErrors.category && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Total Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.totalMarks 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                      }`}
                      placeholder="100"
                      min="1"
                      max="1000"
                      required
                    />
                    {fieldErrors.totalMarks && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.totalMarks}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Max marks: 1000</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Passing Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="passingMarks"
                      value={formData.passingMarks}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.passingMarks 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                      }`}
                      placeholder="33"
                      min="0"
                      max={formData.totalMarks}
                      required
                    />
                    {fieldErrors.passingMarks && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.passingMarks}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Must be ≤ total marks</p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Create Subject
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Subject Modal */}
        {showEditModal && editingSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-blue-600">Edit Subject</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSubject(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-4">
                {/* Required Fields Notice */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-blue-800 mb-2">📋 Required Fields:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                    <div>✓ Subject Name (2-100 characters)</div>
                    <div>✓ Subject Code (2-20 alphanumeric)</div>
                    <div>✓ Category (Core, Elective, etc.)</div>
                    <div>✓ Total Marks (1-1000)</div>
                    <div>✓ Passing Marks (≤ Total Marks)</div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 <span className="text-red-500">*</span> indicates required fields
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.name 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="e.g., Mathematics"
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
                      Subject Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none uppercase transition-all ${
                        fieldErrors.code 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="e.g., MATH101"
                      required
                    />
                    {fieldErrors.code && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.code}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Letters, numbers, -, _ only</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    rows="3"
                    placeholder="Brief description of the subject (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - Add subject details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.category 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {fieldErrors.category && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Total Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.totalMarks 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="100"
                      min="1"
                      max="1000"
                      required
                    />
                    {fieldErrors.totalMarks && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.totalMarks}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Max marks: 1000</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Passing Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="passingMarks"
                      value={formData.passingMarks}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.passingMarks 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="33"
                      min="0"
                      max={formData.totalMarks}
                      required
                    />
                    {fieldErrors.passingMarks && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.passingMarks}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Must be ≤ total marks</p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingSubject(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Update Subject
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


