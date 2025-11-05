import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { 
  FaChalkboardTeacher, FaPlus, FaSearch, FaEdit, FaTrash, FaUsers,
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaSchool, FaSpinner, FaTimes,
  FaSave, FaCalendarAlt, FaGraduationCap, FaBriefcase, FaMoneyBillWave,
  FaExclamationTriangle, FaHome, FaVenusMars, FaBirthdayCake, FaUniversity
} from 'react-icons/fa';

export default function StaffManagement() {
  const { user, token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    // User fields
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    personalEmail: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    // Staff fields
    department: '',
    designation: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    qualification: {
      degree: '',
      specialization: '',
      university: '',
      year: ''
    },
    experience: {
      years: 0
    },
    salary: {
      basicSalary: 0,
      allowances: {
        houseRent: 0,
        transport: 0,
        medical: 0
      }
    },
    bankDetails: {
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      branch: ''
    },
    alternateContact: {
      name: '',
      relation: '',
      phone: '',
      email: ''
    },
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
      address: ''
    }
  });

  // Fetch staff - only run once when token is available
  useEffect(() => {
    console.log('Auth State - User:', user);
    console.log('Auth State - Token:', token ? 'Available' : 'Not available');
    console.log('User Role:', user?.role);
    
    if (token && user?.role === 'admin') {
      fetchStaff();
    } else if (token && !user) {
      console.warn('Token available but user not loaded yet, waiting...');
    } else {
      console.warn('No token available, skipping staff fetch');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token, not user to prevent re-fetch loops

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Staff API Response:', response.data);
      
      // Handle different response formats
      const staffData = response.data.data || response.data.staff || response.data || [];
      console.log('Staff Data:', staffData);
      
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      console.error('Error details:', error.response?.data);
      
      // If user not found or unauthorized, clear session silently
      if (error.response?.status === 401 || error.response?.status === 403) {
        const errorMsg = error.response?.data?.message || '';
        if (errorMsg.includes('User not found') || errorMsg.includes('Invalid token')) {
          console.warn('Invalid session detected, clearing...');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          window.location.href = '/login';
          return;
        }
      }
      
      setError(error.response?.data?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;

    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.length < 2) return 'Must be at least 2 characters';
        return '';
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.length < 2) return 'Must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Invalid email format';
        return '';
      case 'personalEmail':
        if (value && !emailRegex.test(value)) return 'Invalid email format';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone is required';
        if (!phoneRegex.test(value)) return 'Only digits, spaces, +, -, () allowed';
        if (value.replace(/\D/g, '').length < 10) return 'Minimum 10 digits required';
        return '';
      case 'department':
        if (!value) return 'Department is required';
        return '';
      case 'designation':
        if (!value.trim()) return 'Designation is required';
        return '';
      case 'salary.basicSalary':
        if (!value || value <= 0) return 'Must be greater than 0';
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

    // Validate field in real-time for edit modal
    if (showEditModal) {
      const error = validateField(name, value);
      if (error) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, nested, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [nested]: {
              ...prev[parent][nested],
              [child]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/admin/staff', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show credentials if they were generated
      if (response.data.credentials) {
        setGeneratedCredentials(response.data.credentials);
        setShowCredentials(true);
      }

      setSuccess('Staff member added successfully!');
      setShowModal(false);
      resetForm();
      fetchStaff();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error adding staff:', error);
      setError(error.response?.data?.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = [];

    // Required field validation
    if (!formData.firstName?.trim()) {
      errors.push('First name is required');
    }
    if (!formData.lastName?.trim()) {
      errors.push('Last name is required');
    }
    if (!formData.email?.trim()) {
      errors.push('Email is required');
    }
    if (!formData.phone?.trim()) {
      errors.push('Phone number is required');
    }
    if (!formData.department) {
      errors.push('Department is required');
    }
    if (!formData.designation?.trim()) {
      errors.push('Designation is required');
    }
    if (!formData.salary?.basicSalary || formData.salary.basicSalary <= 0) {
      errors.push('Basic salary must be greater than 0');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Personal email validation (if provided)
    if (formData.personalEmail && !emailRegex.test(formData.personalEmail)) {
      errors.push('Please enter a valid personal email address');
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.push('Please enter a valid phone number (digits, spaces, +, -, () only)');
    }
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      errors.push('Phone number must have at least 10 digits');
    }

    // Name length validation
    if (formData.firstName && formData.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (formData.lastName && formData.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    // Salary validation
    if (formData.salary?.allowances?.houseRent < 0) {
      errors.push('House rent allowance cannot be negative');
    }
    if (formData.salary?.allowances?.transport < 0) {
      errors.push('Transport allowance cannot be negative');
    }
    if (formData.salary?.allowances?.medical < 0) {
      errors.push('Medical allowance cannot be negative');
    }

    return errors;
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setSubmitting(false);
      return;
    }

    try {
      console.log('Sending update request with data:', formData);
      
      const response = await axios.put(`/api/admin/staff/${editingStaff._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Update response:', response.data);

      setSuccess('Staff member updated successfully!');
      setShowEditModal(false);
      setEditingStaff(null);
      resetForm();
      fetchStaff();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating staff:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to update staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await axios.delete(`/api/admin/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Staff member deleted successfully!');
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting staff:', error);
      setError(error.response?.data?.message || 'Failed to delete staff member');
    }
  };

  const openEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      firstName: staffMember.user?.firstName || '',
      lastName: staffMember.user?.lastName || '',
      email: staffMember.user?.email || '',
      password: '',
      phone: staffMember.user?.phone || '',
      personalEmail: staffMember.user?.personalEmail || '',
      dateOfBirth: staffMember.user?.dateOfBirth ? new Date(staffMember.user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: staffMember.user?.gender || '',
      address: staffMember.user?.address || { street: '', city: '', state: '', pincode: '', country: 'India' },
      department: staffMember.department || '',
      designation: staffMember.designation || '',
      dateOfJoining: staffMember.dateOfJoining ? new Date(staffMember.dateOfJoining).toISOString().split('T')[0] : '',
      qualification: staffMember.qualification || { degree: '', specialization: '', university: '', year: '' },
      experience: staffMember.experience || { years: 0 },
      salary: staffMember.salary || { basicSalary: 0, allowances: { houseRent: 0, transport: 0, medical: 0 } },
      bankDetails: staffMember.bankDetails || { accountNumber: '', accountHolderName: '', ifscCode: '', bankName: '', branch: '' },
      alternateContact: staffMember.alternateContact || { name: '', relation: '', phone: '', email: '' },
      emergencyContact: staffMember.emergencyContact || { name: '', relation: '', phone: '', address: '' }
    });
    setFieldErrors({}); // Clear any previous field errors
    setError(''); // Clear any previous error messages
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      personalEmail: '',
      dateOfBirth: '',
      gender: '',
      address: { street: '', city: '', state: '', pincode: '', country: 'India' },
      department: '',
      designation: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      qualification: { degree: '', specialization: '', university: '', year: '' },
      experience: { years: 0 },
      salary: { basicSalary: 0, allowances: { houseRent: 0, transport: 0, medical: 0 } },
      bankDetails: { accountNumber: '', accountHolderName: '', ifscCode: '', bankName: '', branch: '' },
      alternateContact: { name: '', relation: '', phone: '', email: '' },
      emergencyContact: { name: '', relation: '', phone: '', address: '' }
    });
    setFieldErrors({}); // Clear all field errors
    setError(''); // Clear error message
  };

  const filteredStaff = staff.filter(member =>
    member.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Animated Background Blobs */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          {/* Header */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-green-500/20 transition-all duration-500 animate-fadeInUp border-2 border-green-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow">
                  <FaChalkboardTeacher className="text-white text-3xl sm:text-4xl" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent mb-2 animate-gradient">
                    Staff Management
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Manage all teaching and non-teaching staff
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="group flex items-center gap-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300 animate-gradient whitespace-nowrap"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <FaPlus className="text-lg" />
                </div>
                <span className="text-sm sm:text-base">Add New Staff</span>
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="relative animate-slideInDown">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-5 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 animate-bounce-slow">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-green-700 font-bold text-base sm:text-lg">{success}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="relative animate-slideInDown">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-500 rounded-2xl p-5 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 animate-pulse">
                  <span className="text-2xl">❌</span>
                </div>
                <p className="text-red-700 font-bold text-base sm:text-lg">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaChalkboardTeacher className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{staff.length}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Total Staff</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{filteredStaff.filter(s => s.status === 'active').length}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Active Staff</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaSchool className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{staff.filter(s => s.department === 'Teaching').length}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Teaching Staff</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaSearch className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{filteredStaff.length}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Search Results</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-green-500 group-hover:scale-110 transition-transform">
                  <FaSearch className="text-xl" />
                </div>
                <input
                  type="text"
                  placeholder="🔍 Search staff by name, employee ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none text-base font-semibold transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Staff Table */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-2xl p-20 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-8 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-green-600 animate-pulse" />
              </div>
              <p className="mt-6 text-gray-600 font-bold text-lg">Loading staff...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-100">
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-black text-lg flex items-center gap-3">
                  <FaUsers className="text-2xl" />
                  All Staff Members
                </h3>
                <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-white font-bold text-sm">
                  {filteredStaff.length} {filteredStaff.length === 1 ? 'Member' : 'Members'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Staff Name</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Designation</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-green-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                              <FaChalkboardTeacher className="text-5xl text-green-400" />
                            </div>
                            <p className="text-xl font-black text-gray-900 mb-2">No staff found</p>
                            <p className="text-gray-500 font-semibold mb-6">
                              {searchTerm ? 'Try adjusting your search criteria' : 'Add your first staff member to get started'}
                            </p>
                            {!searchTerm && (
                              <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                              >
                                <FaPlus />
                                Add First Staff Member
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((member, index) => (
                        <tr key={member._id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group">
                          <td className="px-6 py-5 text-sm font-bold text-green-600">{member.employeeId}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-500 flex items-center justify-center text-white font-black text-base shadow-lg group-hover:scale-110 transition-transform">
                                  {member.user?.firstName?.charAt(0)}{member.user?.lastName?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{member.user?.firstName} {member.user?.lastName}</p>
                                <p className="text-xs text-gray-500 font-semibold">{member.user?.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                              {member.department}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700 font-semibold">{member.designation}</td>
                          <td className="px-6 py-5 text-sm text-gray-700 font-semibold">{member.user?.email}</td>
                          <td className="px-6 py-5 text-sm text-gray-700 font-semibold">{member.user?.phone}</td>
                          <td className="px-6 py-5">
                            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                              member.status === 'active' 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openEditModal(member)}
                                className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-110 transition-all"
                                title="Edit Staff"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDelete(member._id)}
                                className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:scale-110 transition-all"
                                title="Delete Staff"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Staff Modal - Will continue in next part due to length */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto border-4 border-green-200 animate-slideInUp">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white px-8 py-6 rounded-t-3xl flex justify-between items-center z-10 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center animate-pulse-slow">
                    <FaChalkboardTeacher className="text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black">Add New Staff Member</h2>
                    <p className="text-sm text-white text-opacity-90 font-semibold">Fill in the details below</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setError('');
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all hover:rotate-90 transform duration-300"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-gradient-to-br from-green-50 via-white to-emerald-50">
                {/* Important Information about Duplicate Names */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">💡</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-green-900 mb-3">Multiple Staff with Same Name? No Problem!</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span><strong>Same staff names allowed:</strong> You can add multiple &quot;Rajesh Kumar&quot; or &quot;John Smith&quot; teachers</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span><strong>Same designations allowed:</strong> Multiple &quot;Senior Teacher&quot; or &quot;Lab Assistant&quot;</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span><strong>Same department allowed:</strong> Multiple staff in &quot;Teaching&quot; or &quot;Administrative&quot;</span>
                        </p>
                        
                        {/* Real-world Examples */}
                        <div className="mt-5 pt-4 border-t-2 border-green-200">
                          <p className="font-bold text-green-900 mb-3">📝 Real-World Examples:</p>
                          <div className="bg-white rounded-xl p-4 mb-3 border-2 border-green-200">
                            <p className="font-bold text-green-700 mb-2">Example 1: Same Staff Names ✅</p>
                            <div className="text-xs space-y-1 ml-4">
                              <p>• Teacher 1: <strong>Rajesh Kumar</strong> (EMP20240001, rajesh.k1@school.com)</p>
                              <p>• Teacher 2: <strong>Rajesh Kumar</strong> (EMP20240002, rajesh.k2@school.com)</p>
                              <p className="text-green-600 font-semibold mt-2">✓ Both stored successfully in same department!</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 mb-3 border-2 border-blue-200">
                            <p className="font-bold text-blue-700 mb-2">Example 2: Same Designation ✅</p>
                            <div className="text-xs space-y-1 ml-4">
                              <p>• Staff 1: <strong>Amit Shah</strong> - Senior Teacher (amit@school.com)</p>
                              <p>• Staff 2: <strong>Priya Patel</strong> - Senior Teacher (priya@school.com)</p>
                              <p>• Staff 3: <strong>Rahul Singh</strong> - Senior Teacher (rahul@school.com)</p>
                              <p className="text-blue-600 font-semibold mt-2">✓ All stored with same designation!</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                            <p className="font-bold text-purple-700 mb-2">Example 3: Spouse Teachers ✅</p>
                            <div className="text-xs space-y-1 ml-4">
                              <p>• Husband: <strong>Mr. Sharma</strong> (mrsharm@school.com, Same Address)</p>
                              <p>• Wife: <strong>Mrs. Sharma</strong> (mrssharm@school.com, Same Address)</p>
                              <p className="text-purple-600 font-semibold mt-2">✓ Both stored with same address!</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t-2 border-green-200">
                          <p className="font-bold text-green-900 mb-2">🔐 What must be unique:</p>
                          <ul className="space-y-1 ml-6">
                            <li className="flex items-center gap-2">
                              <span className="text-green-600">🔹</span>
                              <span><strong>Employee ID</strong> - Auto-generated, globally unique</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-600">🔹</span>
                              <span><strong>Official Email</strong> - Must be unique for login</span>
                            </li>
                          </ul>
                          <p className="text-xs text-gray-600 mt-3 italic">Note: Personal email, phone, and all other fields can be duplicate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-500 rounded-2xl p-5 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-700 font-bold text-base">{error}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                      Personal Information
                    </h3>
                  </div>
                  <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-4">
                    <p className="text-green-800 font-semibold flex items-start gap-2">
                      <span className="text-2xl">✅</span>
                      <span><strong>Note:</strong> Multiple staff members can have the same name. The system uses unique identifiers (Employee ID, Email) to distinguish them.</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaBirthdayCake />
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaVenusMars />
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact & Login Information */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaEnvelope className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                      Contact & Login Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaEnvelope />
                        Official Email (Login ID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="staff@school.com"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">This will be used for login</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaEnvelope />
                        Personal Email
                      </label>
                      <input
                        type="email"
                        name="personalEmail"
                        value={formData.personalEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="personal@email.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">For personal communication</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaPhone />
                        Primary Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Password (for staff login) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="Minimum 6 characters"
                        minLength="6"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Alternative Contact */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-teal-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaPhone className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                      Alternative Contact <span className="text-sm text-gray-500">(Optional)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Contact Name</label>
                      <input
                        type="text"
                        name="alternateContact.name"
                        value={formData.alternateContact.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., Spouse Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Relation</label>
                      <input
                        type="text"
                        name="alternateContact.relation"
                        value={formData.alternateContact.relation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., Spouse, Sibling"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="alternateContact.phone"
                        value={formData.alternateContact.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="alternateContact.email"
                        value={formData.alternateContact.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="alternate@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaExclamationTriangle className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
                      Emergency Contact <span className="text-sm text-gray-500">(Recommended)</span>
                    </h3>
                  </div>
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
                    <p className="text-yellow-800 font-semibold flex items-center gap-2">
                      <FaExclamationTriangle className="text-xl" />
                      <span>To be contacted in case of emergencies</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Contact Name</label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., Family Member Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Relation</label>
                      <input
                        type="text"
                        name="emergencyContact.relation"
                        value={formData.emergencyContact.relation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., Parent, Spouse"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        name="emergencyContact.address"
                        value={formData.emergencyContact.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="Emergency contact address"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaHome className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                      Address
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Street</label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaIdCard className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      Employment Details
                    </h3>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                      <p className="text-blue-800 font-semibold flex items-center gap-2">
                        <FaIdCard className="text-xl" />
                        <span>Employee ID will be generated automatically (e.g., EMP20240001)</span>
                      </p>
                    </div>
                    <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
                      <p className="text-purple-800 font-semibold text-sm flex items-start gap-2">
                        <span className="text-lg">ℹ️</span>
                        <span><strong>Note:</strong> Multiple staff can have the same department and designation. Each is uniquely identified by Employee ID.</span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Teaching">Teaching</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Support">Support</option>
                        <option value="Management">Management</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., Senior Teacher, Principal"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarAlt />
                        Date of Joining <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        value={formData.dateOfJoining}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaBriefcase />
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experience.years"
                        value={formData.experience.years}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Qualification */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaGraduationCap className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                      Qualification <span className="text-sm text-gray-500">(Optional)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Degree</label>
                      <input
                        type="text"
                        name="qualification.degree"
                        value={formData.qualification.degree}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., B.Ed, M.Sc"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Specialization</label>
                      <input
                        type="text"
                        name="qualification.specialization"
                        value={formData.qualification.specialization}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., Mathematics, Physics"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaUniversity />
                        University
                      </label>
                      <input
                        type="text"
                        name="qualification.university"
                        value={formData.qualification.university}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Year</label>
                      <input
                        type="number"
                        name="qualification.year"
                        value={formData.qualification.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                </div>

                {/* Salary Details */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaMoneyBillWave className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                      Salary Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Basic Salary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="salary.basicSalary"
                        value={formData.salary.basicSalary}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="₹"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">House Rent Allowance</label>
                      <input
                        type="number"
                        name="salary.allowances.houseRent"
                        value={formData.salary.allowances.houseRent}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="₹"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Transport Allowance</label>
                      <input
                        type="number"
                        name="salary.allowances.transport"
                        value={formData.salary.allowances.transport}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="₹"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Medical Allowance</label>
                      <input
                        type="number"
                        name="salary.allowances.medical"
                        value={formData.salary.allowances.medical}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="₹"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-cyan-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaMoneyBillWave className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                      Bank Details <span className="text-sm text-gray-500">(Optional)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name</label>
                      <input
                        type="text"
                        name="bankDetails.accountHolderName"
                        value={formData.bankDetails.accountHolderName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        name="bankDetails.accountNumber"
                        value={formData.bankDetails.accountNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        name="bankDetails.bankName"
                        value={formData.bankDetails.bankName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        name="bankDetails.ifscCode"
                        value={formData.bankDetails.ifscCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., SBIN0001234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Branch</label>
                      <input
                        type="text"
                        name="bankDetails.branch"
                        value={formData.bankDetails.branch}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600 font-semibold">
                      <span className="text-red-500">*</span> Required fields must be filled
                    </p>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                          setError('');
                        }}
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all hover:scale-105 shadow-lg"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white px-10 py-4 rounded-xl font-bold shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="animate-spin text-xl" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <FaSave className="text-xl" />
                            <span>Save Staff Member</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Credentials Display Modal */}
        {showCredentials && generatedCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-green-200 animate-scaleIn">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                  <span className="text-5xl">✅</span>
                </div>
                <h2 className="text-3xl font-black text-gradient mb-2">Staff Account Created Successfully!</h2>
                <p className="text-gray-600 font-semibold">Please save these login credentials</p>
              </div>

              {/* Staff Credentials */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300 mb-6">
                <h3 className="text-xl font-black text-green-900 mb-4 flex items-center gap-2">
                  <FaChalkboardTeacher /> Staff Login Credentials
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded-xl p-4">
                    <span className="font-bold text-gray-700">Employee ID:</span>
                    <span className="text-green-600 font-mono font-bold">{generatedCredentials.employeeId}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl p-4">
                    <span className="font-bold text-gray-700">Email:</span>
                    <span className="text-green-600 font-mono">{generatedCredentials.email}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl p-4">
                    <span className="font-bold text-gray-700">Password:</span>
                    <span className="text-green-600 font-mono">{generatedCredentials.password}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex items-start gap-3 mb-6">
                <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-1" />
                <p className="text-sm text-yellow-800 font-semibold">
                  <strong>Important:</strong> Please save these credentials securely. The staff member should change their password after first login.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCredentials(false);
                  setGeneratedCredentials(null);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit Staff Modal */}
        {showEditModal && editingStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto border-4 border-blue-200 animate-slideInUp">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-6 rounded-t-3xl flex justify-between items-center z-10 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                    <FaEdit className="text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black">Edit Staff Member</h2>
                    <p className="text-sm text-white text-opacity-90 font-semibold">Update staff information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
                    resetForm();
                    setError('');
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all hover:rotate-90 transform duration-300"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body - Simplified Edit Form */}
              <form onSubmit={handleEdit} className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-500 rounded-2xl p-5 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-700 font-bold text-base">{error}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                  <h3 className="text-2xl font-black text-gradient">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.firstName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        required 
                      />
                      {fieldErrors.firstName && (
                        <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.lastName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        required 
                      />
                      {fieldErrors.lastName && (
                        <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.lastName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Official Email <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        required 
                      />
                      {fieldErrors.email && (
                        <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.phone 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="+91 1234567890"
                        required 
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Personal Email</label>
                      <input 
                        type="email" 
                        name="personalEmail" 
                        value={formData.personalEmail} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.personalEmail 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                      />
                      {fieldErrors.personalEmail && (
                        <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.personalEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Date of Joining</label>
                      <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                  <h3 className="text-2xl font-black text-gradient">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Department <span className="text-red-500">*</span></label>
                      <select 
                        name="department" 
                        value={formData.department} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.department 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Teaching">Teaching</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Support">Support</option>
                        <option value="Management">Management</option>
                      </select>
                      {fieldErrors.department && (
                        <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.department}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Designation <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="designation" 
                        value={formData.designation} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.designation 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="e.g., Senior Teacher"
                        required 
                      />
                      {fieldErrors.designation && (
                        <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.designation}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Basic Salary <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        name="salary.basicSalary" 
                        value={formData.salary.basicSalary} 
                        onChange={handleInputChange} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors['salary.basicSalary'] 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="₹ 0"
                        min="0"
                        required 
                      />
                      {fieldErrors['salary.basicSalary'] && (
                        <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors['salary.basicSalary']}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingStaff(null); resetForm(); setError(''); }} className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all disabled:opacity-50">
                    {submitting ? (<><FaSpinner className="animate-spin text-xl" /><span>Updating...</span></>) : (<><FaSave className="text-xl" /><span>Update Staff</span></>)}
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
