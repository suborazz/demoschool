import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUserGraduate, FaPlus, FaTimes, FaSearch, FaEdit, FaTrash,
  FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars,
  FaHome, FaSchool, FaIdCard, FaCalendarAlt, FaUsers,
  FaTint, FaExclamationTriangle, FaSave, FaSpinner
} from 'react-icons/fa';

export default function StudentManagement() {
  const { user, token } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    // Student fields - admissionNumber will be auto-generated
    rollNumber: '',
    classId: '',
    section: '',
    academicYear: '2024-2025',
    dateOfAdmission: new Date().toISOString().split('T')[0],
    previousSchool: {
      name: '',
      location: ''
    },
    bloodGroup: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
    medicalInfo: {
      allergies: '',
      medications: '',
      conditions: ''
    },
    // Parent fields
    father: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      occupation: '',
      workDetails: {
        company: '',
        designation: '',
        officePhone: ''
      }
    },
    mother: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      occupation: '',
      workDetails: {
        company: '',
        designation: '',
        officePhone: ''
      }
    }
  });

  // Fetch students and classes - only run once when token is available
  useEffect(() => {
    console.log('Auth State - User:', user);
    console.log('Auth State - Token:', token ? 'Available' : 'Not available');
    console.log('User Role:', user?.role);
    
    if (token && user?.role === 'admin') {
      fetchStudents();
      fetchClasses();
    } else if (token && !user) {
      console.warn('Token available but user not loaded yet, waiting...');
    } else {
      console.warn('No token available, skipping students fetch');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token, not user to prevent re-fetch loops

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Students API Response:', response.data);
      
      // Handle different response formats
      const studentsData = response.data.students || response.data.data || response.data || [];
      console.log('Students Data:', studentsData);
      
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching students:', error);
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
      
      toast.error(error.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Classes API Response:', response.data);
      
      // Handle different response formats
      const classesData = response.data.data || response.data.classes || [];
      console.log('Classes Data:', classesData);
      
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
      setClasses([]); // Set to empty array on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validate field in real-time for non-nested fields
    if (!name.includes('.')) {
      const error = validateField(name, value);
      if (error) {
        setFieldErrors(prev => ({ ...prev, [name]: error }));
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
        // Handle father.workDetails.company format
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

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (value.trim().length > 50) return 'First name must not exceed 50 characters';
        if (!nameRegex.test(value)) return 'First name should only contain letters';
        return '';
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (value.trim().length > 50) return 'Last name must not exceed 50 characters';
        if (!nameRegex.test(value)) return 'Last name should only contain letters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address (e.g., student@example.com)';
        if (value.length > 100) return 'Email must not exceed 100 characters';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (value.length > 50) return 'Password must not exceed 50 characters';
        if (!/[A-Za-z]/.test(value)) return 'Password must contain at least one letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value)) return 'Only digits, spaces, +, -, () allowed';
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10) return 'Phone must have at least 10 digits';
        if (digits.length > 15) return 'Phone must not exceed 15 digits';
        return '';
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        const dob = new Date(value);
        const today = new Date();
        if (dob > today) return 'Date of birth cannot be in the future';
        const age = Math.floor((today - dob) / 31557600000);
        if (age < 3) return 'Student must be at least 3 years old';
        if (age > 25) return 'Student age must not exceed 25 years';
        return '';
      case 'gender':
        if (!value) return 'Gender is required';
        if (!['male', 'female', 'other'].includes(value.toLowerCase())) return 'Please select a valid gender';
        return '';
      case 'rollNumber':
        if (!value.trim()) return 'Roll number is required';
        if (value.trim().length < 1) return 'Roll number must be at least 1 character';
        if (value.trim().length > 20) return 'Roll number must not exceed 20 characters';
        return '';
      case 'classId':
        if (!value) return 'Class is required';
        return '';
      case 'section':
        if (!value.trim()) return 'Section is required';
        if (value.trim().length > 10) return 'Section must not exceed 10 characters';
        return '';
      case 'bloodGroup':
        if (value && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(value)) {
          return 'Please select a valid blood group';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    
    // Basic student info validation
    const firstNameError = validateField('firstName', formData.firstName);
    if (firstNameError) errors.firstName = firstNameError;
    
    const lastNameError = validateField('lastName', formData.lastName);
    if (lastNameError) errors.lastName = lastNameError;
    
    const emailError = validateField('email', formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validateField('password', formData.password);
    if (passwordError) errors.password = passwordError;
    
    const phoneError = validateField('phone', formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    const dobError = validateField('dateOfBirth', formData.dateOfBirth);
    if (dobError) errors.dateOfBirth = dobError;
    
    const genderError = validateField('gender', formData.gender);
    if (genderError) errors.gender = genderError;
    
    const rollError = validateField('rollNumber', formData.rollNumber);
    if (rollError) errors.rollNumber = rollError;
    
    const classError = validateField('classId', formData.classId);
    if (classError) errors.classId = classError;
    
    const sectionError = validateField('section', formData.section);
    if (sectionError) errors.section = sectionError;

    // Validate blood group if provided
    const bloodGroupError = validateField('bloodGroup', formData.bloodGroup);
    if (bloodGroupError) errors.bloodGroup = bloodGroupError;
    
    // Validate parent emails if provided
    if (formData.father.email) {
      if (!emailRegex.test(formData.father.email)) {
        errors['father.email'] = 'Invalid email format for father';
      }
      if (formData.father.email.toLowerCase() === formData.email.toLowerCase()) {
        errors['father.email'] = 'Father\'s email must be different from student email';
      }
    }
    
    if (formData.mother.email) {
      if (!emailRegex.test(formData.mother.email)) {
        errors['mother.email'] = 'Invalid email format for mother';
      }
      if (formData.mother.email.toLowerCase() === formData.email.toLowerCase()) {
        errors['mother.email'] = 'Mother\'s email must be different from student email';
      }
      if (formData.father.email && formData.mother.email.toLowerCase() === formData.father.email.toLowerCase()) {
        errors['mother.email'] = 'Mother\'s email must be different from father\'s email';
      }
    }
    
    // Validate parent phone numbers if provided
    if (formData.father.phone) {
      if (!phoneRegex.test(formData.father.phone)) {
        errors['father.phone'] = 'Invalid phone format for father';
      }
      const fatherDigits = formData.father.phone.replace(/\D/g, '');
      if (fatherDigits.length < 10) {
        errors['father.phone'] = 'Father\'s phone must have at least 10 digits';
      }
    }
    
    if (formData.mother.phone) {
      if (!phoneRegex.test(formData.mother.phone)) {
        errors['mother.phone'] = 'Invalid phone format for mother';
      }
      const motherDigits = formData.mother.phone.replace(/\D/g, '');
      if (motherDigits.length < 10) {
        errors['mother.phone'] = 'Mother\'s phone must have at least 10 digits';
      }
    }
    
    // Validate emergency contact if provided
    if (formData.emergencyContact.phone) {
      if (!phoneRegex.test(formData.emergencyContact.phone)) {
        errors['emergencyContact.phone'] = 'Invalid emergency contact phone format';
      }
      const emergencyDigits = formData.emergencyContact.phone.replace(/\D/g, '');
      if (emergencyDigits.length < 10) {
        errors['emergencyContact.phone'] = 'Emergency contact must have at least 10 digits';
      }
    }
    
    if (formData.emergencyContact.name && formData.emergencyContact.name.trim().length < 2) {
      errors['emergencyContact.name'] = 'Emergency contact name must be at least 2 characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      // Client-side validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errors = validateForm();
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Convert comma-separated strings to arrays for medical info
      const submissionData = {
        ...formData,
        medicalInfo: {
          allergies: formData.medicalInfo.allergies ? formData.medicalInfo.allergies.split(',').map(s => s.trim()) : [],
          medications: formData.medicalInfo.medications ? formData.medicalInfo.medications.split(',').map(s => s.trim()) : [],
          conditions: formData.medicalInfo.conditions ? formData.medicalInfo.conditions.split(',').map(s => s.trim()) : []
        }
      };

      const response = await axios.post('/api/admin/students', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show credentials if they were generated
      if (response.data.credentials) {
        // Add admission number to student credentials
        const credentials = {
          ...response.data.credentials,
          student: {
            ...response.data.credentials.student,
            admissionNumber: response.data.student.admissionNumber
          }
        };
        setGeneratedCredentials(credentials);
        setShowCredentials(true);
      }

      toast.success(`Student added successfully! Admission Number: ${response.data.student.admissionNumber}`);
      setShowModal(false);
      resetForm();
      fetchStudents(); // Refresh list
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submissionData = {
        ...formData,
        medicalInfo: {
          allergies: formData.medicalInfo.allergies ? formData.medicalInfo.allergies.split(',').map(s => s.trim()) : [],
          medications: formData.medicalInfo.medications ? formData.medicalInfo.medications.split(',').map(s => s.trim()) : [],
          conditions: formData.medicalInfo.conditions ? formData.medicalInfo.conditions.split(',').map(s => s.trim()) : []
        }
      };

      await axios.put(`/api/admin/students/${editingStudent._id}`, submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(error.response?.data?.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await axios.delete(`/api/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.user?.firstName || '',
      lastName: student.user?.lastName || '',
      email: student.user?.email || '',
      password: '',
      phone: student.user?.phone || '',
      dateOfBirth: student.user?.dateOfBirth ? new Date(student.user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.user?.gender || '',
      address: student.user?.address || { street: '', city: '', state: '', pincode: '', country: 'India' },
      rollNumber: student.rollNumber || '',
      classId: student.class?._id || '',
      section: student.section || '',
      academicYear: student.academicYear || '',
      dateOfAdmission: student.dateOfAdmission ? new Date(student.dateOfAdmission).toISOString().split('T')[0] : '',
      previousSchool: student.previousSchool || { name: '', location: '' },
      bloodGroup: student.bloodGroup || '',
      emergencyContact: student.emergencyContact || { name: '', relation: '', phone: '' },
      medicalInfo: {
        allergies: student.medicalInfo?.allergies?.join(', ') || '',
        medications: student.medicalInfo?.medications?.join(', ') || '',
        conditions: student.medicalInfo?.conditions?.join(', ') || ''
      },
      father: { firstName: '', lastName: '', email: '', phone: '', occupation: '', workDetails: { company: '', designation: '', officePhone: '' } },
      mother: { firstName: '', lastName: '', email: '', phone: '', occupation: '', workDetails: { company: '', designation: '', officePhone: '' } }
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: { street: '', city: '', state: '', pincode: '', country: 'India' },
      rollNumber: '',
      classId: '',
      section: '',
      academicYear: '2024-2025',
      dateOfAdmission: new Date().toISOString().split('T')[0],
      previousSchool: { name: '', location: '' },
      bloodGroup: '',
      emergencyContact: { name: '', relation: '', phone: '' },
      medicalInfo: { allergies: '', medications: '', conditions: '' },
      father: { firstName: '', lastName: '', email: '', phone: '', occupation: '', workDetails: { company: '', designation: '', officePhone: '' } },
      mother: { firstName: '', lastName: '', email: '', phone: '', occupation: '', workDetails: { company: '', designation: '', officePhone: '' } }
    });
  };

  const filteredStudents = students.filter(student =>
    student.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Animated Background Blobs */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          {/* Header - Enhanced */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500 animate-fadeInUp border-2 border-purple-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow">
                  <FaUserGraduate className="text-white text-3xl sm:text-4xl" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-gradient">
                    Student Management
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Manage all students in your school
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="group flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 animate-gradient whitespace-nowrap"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <FaPlus className="text-lg" />
                </div>
                <span className="text-sm sm:text-base">Add New Student</span>
              </button>
            </div>
          </div>

          {/* Success/Error Messages - Enhanced */}
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

          {/* Stats Cards - NEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaUserGraduate className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{students.length}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Total Students</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{filteredStudents.length}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Active Students</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaSchool className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{classes.length}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Total Classes</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaSearch className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{filteredStudents.length}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Search Results</p>
            </div>
          </div>

          {/* Search Bar - Enhanced */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-purple-500 group-hover:scale-110 transition-transform">
                  <FaSearch className="text-xl" />
                </div>
                <input
                  type="text"
                  placeholder="🔍 Search students by name, admission number, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none text-base font-semibold transition-all"
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

          {/* Students List - Enhanced */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-2xl p-20 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-purple-600 animate-pulse" />
              </div>
              <p className="mt-6 text-gray-600 font-bold text-lg">Loading students...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-100">
              {/* Table Header with Count */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-black text-lg flex items-center gap-3">
                  <FaUsers className="text-2xl" />
                  All Students
                </h3>
                <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-white font-bold text-sm">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Admission No.</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Roll No.</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Section</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                              <FaUserGraduate className="text-5xl text-purple-400" />
                            </div>
                            <p className="text-xl font-black text-gray-900 mb-2">No students found</p>
                            <p className="text-gray-500 font-semibold mb-6">
                              {searchTerm ? 'Try adjusting your search criteria' : 'Add your first student to get started'}
                            </p>
                            {!searchTerm && (
                              <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                              >
                                <FaPlus />
                                Add First Student
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr 
                          key={student._id} 
                          className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-5 text-sm font-bold text-purple-600">
                            {student.admissionNumber}
                          </td>
                          <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                            {student.rollNumber}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-base shadow-lg group-hover:scale-110 transition-transform">
                                  {student.user?.firstName?.charAt(0)}{student.user?.lastName?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{student.user?.firstName} {student.user?.lastName}</p>
                                <p className="text-xs text-gray-500 font-semibold">{student.user?.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                              {student.class?.name}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                              {student.section}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700 font-semibold">
                            {student.user?.email}
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700 font-semibold">
                            {student.user?.phone}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                              student.status === 'active' 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openEditModal(student)}
                                className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-110 transition-all"
                                title="Edit Student"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDelete(student._id)}
                                className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:scale-110 transition-all"
                                title="Delete Student"
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

        {/* Add Student Modal - Enhanced */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto border-4 border-purple-200 animate-slideInUp">
              {/* Modal Header - Enhanced */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-8 py-6 rounded-t-3xl flex justify-between items-center z-10 shadow-2xl animate-gradient">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center animate-pulse-slow">
                    <FaUserGraduate className="text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black">Add New Student</h2>
                    <p className="text-sm text-white text-opacity-90 font-semibold">Fill in the details below</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setError('');
                  }}
                  className="group text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all hover:rotate-90 transform duration-300"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body - Enhanced */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Required Fields Notice */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-purple-800 mb-2">📋 Required Fields:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-purple-700">
                    <div>✓ Student Name (2-50 chars, letters only)</div>
                    <div>✓ Email (valid format, MUST BE UNIQUE)</div>
                    <div>✓ Password (6+ chars, letters + numbers)</div>
                    <div>✓ Phone (10+ digits)</div>
                    <div>✓ Date of Birth (5-18 years)</div>
                    <div>✓ Gender (Male/Female/Other)</div>
                    <div>✓ Roll Number (per class/section/year)</div>
                    <div>✓ Class & Section</div>
                    <div>✓ Blood Group</div>
                    <div>✓ Father&apos;s Name & Email (UNIQUE)</div>
                    <div>✓ Mother&apos;s Name & Email (UNIQUE)</div>
                    <div>✓ Emergency Contact</div>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    💡 <span className="text-red-500">*</span> indicates required fields | Emails must be unique (student, father, mother)
                  </p>
                </div>

                {/* Email Uniqueness Warning */}
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🚫</span>
                    <div>
                      <p className="text-sm font-bold text-red-800 mb-1">Email Uniqueness Policy:</p>
                      <p className="text-xs text-red-700">
                        <strong>NO duplicate emails allowed:</strong> Student email, Father&apos;s email, and Mother&apos;s email must ALL be unique across the entire system. 
                        Each email can only be used once.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Information about Duplicate Names */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">💡</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-indigo-900 mb-3">What Can and Cannot Be Duplicate</h4>
                      
                      <div className="mb-3">
                        <p className="text-sm font-bold text-green-800 mb-2">✅ CAN be duplicate:</p>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span><strong>Student names:</strong> Multiple &quot;Rahul Kumar&quot; or &quot;Priya Sharma&quot; allowed</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span><strong>Parent names:</strong> Multiple &quot;Rajesh Kumar&quot; fathers or &quot;Sunita Sharma&quot; mothers allowed</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span><strong>Phone numbers:</strong> Can be same (e.g., siblings with same parent contact)</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-red-800 mb-2">❌ CANNOT be duplicate:</p>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span><strong>Student Email:</strong> MUST BE UNIQUE - No two students can have same email</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span><strong>Father&apos;s Email:</strong> MUST BE UNIQUE - Each father needs different email</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span><strong>Mother&apos;s Email:</strong> MUST BE UNIQUE - Each mother needs different email</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span><strong>Roll Number:</strong> Unique per class/section/academic year</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span><strong>Admission Number:</strong> Auto-generated, globally unique</span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Real-world Examples */}
                      <div className="mt-5 pt-4 border-t-2 border-indigo-200">
                          <p className="font-bold text-indigo-900 mb-3">📝 Real-World Examples:</p>
                          <div className="bg-white rounded-xl p-4 mb-3 border-2 border-green-200">
                            <p className="font-bold text-green-700 mb-2">Example 1: Same Student Names ✅</p>
                            <div className="text-xs space-y-1 ml-4">
                              <p>• Student 1: <strong>Rahul Kumar</strong> (ADM20240001, rahul1@email.com, Roll: 01)</p>
                              <p>• Student 2: <strong>Rahul Kumar</strong> (ADM20240002, rahul2@email.com, Roll: 02)</p>
                              <p className="text-green-600 font-semibold mt-2">✓ Both stored successfully in same class/section!</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 mb-3 border-2 border-blue-200">
                            <p className="font-bold text-blue-700 mb-2">Example 2: Siblings ✅</p>
                            <div className="text-xs space-y-1 ml-4">
                              <p>• Sister: <strong>Priya Sharma</strong> (priya@email.com, Roll: 03)</p>
                              <p>• Brother: <strong>Arjun Sharma</strong> (arjun@email.com, Roll: 04)</p>
                              <p>• Same Parents: Father &quot;Rajesh Sharma&quot;, Mother &quot;Sunita Sharma&quot;</p>
                              <p className="text-blue-600 font-semibold mt-2">✓ Both share same parent accounts!</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                            <p className="font-bold text-purple-700 mb-2">Example 3: Same Parent Names (Different Families) ✅</p>
                            <div className="text-xs space-y-1 ml-4">
                              <p>• Family A: Father <strong>&quot;Rajesh Kumar&quot;</strong> (rajesh.family1@email.com)</p>
                              <p>• Family B: Father <strong>&quot;Rajesh Kumar&quot;</strong> (rajesh.family2@email.com)</p>
                              <p className="text-purple-600 font-semibold mt-2">✓ Different parent accounts created!</p>
                            </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t-2 border-indigo-200">
                        <p className="font-bold text-indigo-900 mb-2">🔐 What must be unique:</p>
                        <ul className="space-y-1 ml-6">
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600">🔹</span>
                            <span><strong>Admission Number</strong> - Auto-generated, globally unique</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600">🔹</span>
                            <span><strong>Email addresses</strong> - Student, father, mother each need unique emails</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600">🔹</span>
                            <span><strong>Roll number</strong> - Unique within same class/section/year only</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-500 rounded-2xl p-5 shadow-xl flex items-center gap-4 animate-shake">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-700 font-bold text-base">{error}</p>
                  </div>
                )}

                {/* Personal Information - Enhanced */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      Personal Information
                    </h3>
                  </div>
                  <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-4">
                    <p className="text-green-800 font-semibold flex items-start gap-2">
                      <span className="text-2xl">✅</span>
                      <span><strong>Note:</strong> Multiple students can have the same name. The system uses unique identifiers (Admission Number, Email, Roll Number) to distinguish students.</span>
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
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.firstName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      />
                      {fieldErrors.firstName && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.firstName}
                        </p>
                      )}
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
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.lastName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      />
                      {fieldErrors.lastName && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.lastName}
                        </p>
                      )}
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
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.dateOfBirth 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      />
                      {fieldErrors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.dateOfBirth}
                        </p>
                      )}
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
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.gender 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {fieldErrors.gender && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.gender}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaTint />
                        Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information - Enhanced */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaEnvelope className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                      Contact Information
                    </h3>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 mb-4">
                    <p className="text-purple-800 font-semibold text-sm flex items-start gap-2">
                      <span className="text-lg">📧</span>
                      <span><strong>Important:</strong> Each student must have a unique email address for login purposes.</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaEnvelope />
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaPhone />
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.phone 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Password (for student login) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.password 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                        placeholder="Minimum 6 characters"
                      />
                      {fieldErrors.password && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information - Enhanced */}
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information - Enhanced */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaSchool className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                      Academic Information
                    </h3>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                      <p className="text-blue-800 font-semibold flex items-center gap-2">
                        <FaIdCard className="text-xl" />
                        <span>Admission Number will be generated automatically (e.g., ADM20240001)</span>
                      </p>
                    </div>
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                      <p className="text-amber-800 font-semibold text-sm flex items-start gap-2">
                        <span className="text-lg">⚠️</span>
                        <span><strong>Roll Number:</strong> Must be unique within the same class/section/year. Two students in different sections can have the same roll number.</span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Roll Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.rollNumber 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                        placeholder="e.g., 10A01"
                      />
                      {fieldErrors.rollNumber && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.rollNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="classId"
                        value={formData.classId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.classId 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name} - Grade {cls.grade}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.classId && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.classId}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Section <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                          fieldErrors.section 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                        placeholder="e.g., A, B, C"
                      />
                      {fieldErrors.section && (
                        <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                          <span className="mr-1">⚠️</span>
                          {fieldErrors.section}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Academic Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                        placeholder="e.g., 2024-2025"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarAlt />
                        Date of Admission <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfAdmission"
                        value={formData.dateOfAdmission}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Previous School (Optional) - Enhanced */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-cyan-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaSchool className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                      Previous School <span className="text-sm text-gray-500">(Optional)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">School Name</label>
                      <input
                        type="text"
                        name="previousSchool.name"
                        value={formData.previousSchool.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        name="previousSchool.location"
                        value={formData.previousSchool.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact - Enhanced */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaExclamationTriangle className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                      Emergency Contact
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Contact Name</label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Relation</label>
                      <input
                        type="text"
                        name="emergencyContact.relation"
                        value={formData.emergencyContact.relation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                        placeholder="e.g., Father, Mother"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information (Optional) - Enhanced */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaTint className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                      Medical Information <span className="text-sm text-gray-500">(Optional)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Allergies (comma-separated)</label>
                      <input
                        type="text"
                        name="medicalInfo.allergies"
                        value={formData.medicalInfo.allergies}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                        placeholder="e.g., Peanuts, Dust"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Medications (comma-separated)</label>
                      <input
                        type="text"
                        name="medicalInfo.medications"
                        value={formData.medicalInfo.medications}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                        placeholder="e.g., Insulin, Inhaler"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Medical Conditions (comma-separated)</label>
                      <input
                        type="text"
                        name="medicalInfo.conditions"
                        value={formData.medicalInfo.conditions}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                        placeholder="e.g., Asthma, Diabetes"
                      />
                    </div>
                  </div>
                </div>

                {/* Father Information - Enhanced */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      Father&apos;s Information
                    </h3>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
                    <p className="text-blue-800 font-semibold text-sm flex items-start gap-2">
                      <span className="text-lg">ℹ️</span>
                      <span>Parent names can be the same across different students. Email must be unique for each parent account.</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="father.firstName"
                        value={formData.father.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="father.lastName"
                        value={formData.father.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="father.email"
                        value={formData.father.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                        placeholder="Login email will be created"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="father.phone"
                        value={formData.father.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Occupation</label>
                      <input
                        type="text"
                        name="father.occupation"
                        value={formData.father.occupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        name="father.workDetails.company"
                        value={formData.father.workDetails.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Designation</label>
                      <input
                        type="text"
                        name="father.workDetails.designation"
                        value={formData.father.workDetails.designation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Office Phone</label>
                      <input
                        type="tel"
                        name="father.workDetails.officePhone"
                        value={formData.father.workDetails.officePhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Mother Information - Enhanced */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                      Mother&apos;s Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="mother.firstName"
                        value={formData.mother.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="mother.lastName"
                        value={formData.mother.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="mother.email"
                        value={formData.mother.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                        placeholder="Login email will be created"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="mother.phone"
                        value={formData.mother.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Occupation</label>
                      <input
                        type="text"
                        name="mother.occupation"
                        value={formData.mother.occupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        name="mother.workDetails.company"
                        value={formData.mother.workDetails.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Designation</label>
                      <input
                        type="text"
                        name="mother.workDetails.designation"
                        value={formData.mother.workDetails.designation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Office Phone</label>
                      <input
                        type="tel"
                        name="mother.workDetails.officePhone"
                        value={formData.mother.workDetails.officePhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button - Enhanced */}
                <div className="sticky bottom-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-2xl">
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
                        className="flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-gradient"
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="animate-spin text-xl" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <FaSave className="text-xl" />
                            <span>Save Student</span>
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
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 border-4 border-green-200 animate-scaleIn">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                  <span className="text-5xl">✅</span>
                </div>
                <h2 className="text-3xl font-black text-gradient mb-2">Accounts Created Successfully!</h2>
                <p className="text-gray-600 font-semibold">Please save these login credentials</p>
              </div>

              <div className="space-y-6">
                {/* Student Credentials */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-300">
                  <h3 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-2">
                    <FaUserGraduate /> Student Login Credentials
                  </h3>
                  <div className="space-y-3">
                    {generatedCredentials.student.admissionNumber && (
                      <div className="flex items-center justify-between bg-white rounded-xl p-4">
                        <span className="font-bold text-gray-700">Admission Number:</span>
                        <span className="text-blue-600 font-mono font-bold">{generatedCredentials.student.admissionNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between bg-white rounded-xl p-4">
                      <span className="font-bold text-gray-700">Email:</span>
                      <span className="text-blue-600 font-mono">{generatedCredentials.student.email}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl p-4">
                      <span className="font-bold text-gray-700">Password:</span>
                      <span className="text-blue-600 font-mono">{generatedCredentials.student.password}</span>
                    </div>
                  </div>
                </div>

                {/* Father Credentials */}
                {generatedCredentials.father && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-300">
                    <h3 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-2">
                      <FaUser /> Father Login Credentials
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white rounded-xl p-4">
                        <span className="font-bold text-gray-700">Email:</span>
                        <span className="text-indigo-600 font-mono">{generatedCredentials.father.email}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-xl p-4">
                        <span className="font-bold text-gray-700">Password:</span>
                        <span className="text-indigo-600 font-mono">{generatedCredentials.father.password}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mother Credentials */}
                {generatedCredentials.mother && (
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-300">
                    <h3 className="text-xl font-black text-pink-900 mb-4 flex items-center gap-2">
                      <FaUser /> Mother Login Credentials
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white rounded-xl p-4">
                        <span className="font-bold text-gray-700">Email:</span>
                        <span className="text-pink-600 font-mono">{generatedCredentials.mother.email}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-xl p-4">
                        <span className="font-bold text-gray-700">Password:</span>
                        <span className="text-pink-600 font-mono">{generatedCredentials.mother.password}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex items-start gap-3">
                <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-1" />
                <p className="text-sm text-yellow-800 font-semibold">
                  <strong>Important:</strong> Please save these credentials securely. Users should change their passwords after first login.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCredentials(false);
                  setGeneratedCredentials(null);
                }}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit Student Modal - Similar to Add Modal */}
        {showEditModal && editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto border-4 border-blue-200 animate-slideInUp">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-6 rounded-t-3xl flex justify-between items-center z-10 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                    <FaEdit className="text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black">Edit Student</h2>
                    <p className="text-sm text-white text-opacity-90 font-semibold">Update student information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                    resetForm();
                    setError('');
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all hover:rotate-90 transform duration-300"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body - Reuse same form structure as Add */}
              <form onSubmit={handleEdit} className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Required Fields Notice */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-blue-800 mb-2">📋 Required Fields:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-700">
                    <div>✓ Student Name (2-50 chars, letters only)</div>
                    <div>✓ Email (valid format, MUST BE UNIQUE)</div>
                    <div>✓ Phone (10+ digits)</div>
                    <div>✓ Date of Birth (5-18 years)</div>
                    <div>✓ Gender (Male/Female/Other)</div>
                    <div>✓ Roll Number (per class/section/year)</div>
                    <div>✓ Class & Section</div>
                    <div>✓ Blood Group</div>
                    <div>✓ Father&apos;s Name & Email (UNIQUE)</div>
                    <div>✓ Mother&apos;s Name & Email (UNIQUE)</div>
                    <div>✓ Emergency Contact</div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 <span className="text-red-500">*</span> indicates required fields | Password not required for update
                  </p>
                </div>

                {/* Email Uniqueness Warning */}
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🚫</span>
                    <div>
                      <p className="text-sm font-bold text-red-800 mb-1">Email Uniqueness Policy:</p>
                      <p className="text-xs text-red-700">
                        <strong>NO duplicate emails allowed:</strong> Student email, Father&apos;s email, and Mother&apos;s email must ALL be unique across the entire system.
                      </p>
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
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                  <h3 className="text-2xl font-black text-gradient">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" pattern="[0-9+\-\s()]{10,}" title="Please enter a valid phone number (minimum 10 digits)" required />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100">
                  <h3 className="text-2xl font-black text-gradient">Academic Information</h3>
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
                    <p className="text-blue-800 font-semibold flex items-center gap-2">
                      <FaIdCard className="text-xl" />
                      <span>Admission Number will be generated automatically</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Roll Number <span className="text-red-500">*</span></label>
                      <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" placeholder="e.g., 001, 10A01" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Class <span className="text-red-500">*</span></label>
                      <select name="classId" value={formData.classId} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" required>
                        <option value="">Select Class</option>
                        {classes.map((cls) => (<option key={cls._id} value={cls._id}>{cls.name} - Grade {cls.grade}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Section <span className="text-red-500">*</span></label>
                      <input type="text" name="section" value={formData.section} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none" required />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingStudent(null); resetForm(); setError(''); }} className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all disabled:opacity-50">
                    {submitting ? (<><FaSpinner className="animate-spin text-xl" /><span>Updating...</span></>) : (<><FaSave className="text-xl" /><span>Update Student</span></>)}
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

