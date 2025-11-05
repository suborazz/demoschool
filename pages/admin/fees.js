import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { 
  FaMoneyBillWave, FaPlus, FaSearch, FaDownload, FaCheckCircle,
  FaExclamationCircle, FaClock, FaUsers, FaFileInvoice, FaTimes,
  FaSave, FaSpinner, FaReceipt, FaEdit, FaTrash
} from 'react-icons/fa';

export default function FeeManagement() {
  const { token } = useAuth();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    studentId: '',
    feeType: '',
    totalAmount: '',
    dueDate: '',
    academicYear: new Date().getFullYear().toString(),
    remarks: ''
  });

  const [paymentData, setPaymentData] = useState({
    paymentAmount: '',
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  });

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/fees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFees(response.data.data || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching fees:', error);
      setError(error.response?.data?.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentsData = response.data.students || response.data.data || [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFees();
      fetchStudents();
    }
  }, [token, fetchFees, fetchStudents]);

  const validateField = (name, value) => {
    switch (name) {
      case 'studentId':
        if (!value) return 'Student is required';
        return '';
      case 'feeType':
        if (!value) return 'Fee type is required';
        return '';
      case 'totalAmount':
        if (!value || value <= 0) return 'Amount must be greater than 0';
        return '';
      case 'dueDate':
        if (!value) return 'Due date is required';
        return '';
      case 'paymentAmount':
        if (!value || value <= 0) return 'Amount must be greater than 0';
        return '';
      case 'paymentMethod':
        if (!value) return 'Payment method is required';
        return '';
      default:
        return '';
    }
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

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }

    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const validateFeeForm = () => {
    const errors = [];
    if (!formData.studentId) errors.push('Student is required');
    if (!formData.feeType) errors.push('Fee type is required');
    if (!formData.totalAmount || formData.totalAmount <= 0) errors.push('Amount must be greater than 0');
    if (!formData.dueDate) errors.push('Due date is required');
    return errors;
  };

  const validatePaymentForm = () => {
    const errors = [];
    if (!paymentData.paymentAmount || paymentData.paymentAmount <= 0) errors.push('Payment amount must be greater than 0');
    if (!paymentData.paymentMethod) errors.push('Payment method is required');
    if (parseFloat(paymentData.paymentAmount) > selectedFee?.amountPending) {
      errors.push(`Payment amount cannot exceed pending amount (₹${selectedFee?.amountPending})`);
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const validationErrors = validateFeeForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setSubmitting(false);
      return;
    }

    try {
      await axios.post('/api/admin/fees', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Fee record created successfully!');
      setShowModal(false);
      resetForm();
      fetchFees();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating fee:', error);
      setError(error.response?.data?.message || 'Failed to create fee record');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const validationErrors = validatePaymentForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.put(`/api/admin/fees/${selectedFee._id}`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Payment recorded! Receipt: ${response.data.receiptNumber}`);
      setShowPaymentModal(false);
      setSelectedFee(null);
      resetPaymentForm();
      fetchFees();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error recording payment:', error);
      setError(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (feeId) => {
    if (!confirm('Are you sure you want to delete this fee record?')) return;

    try {
      await axios.delete(`/api/admin/fees/${feeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Fee record deleted successfully!');
      fetchFees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting fee:', error);
      setError(error.response?.data?.message || 'Failed to delete fee');
      setTimeout(() => setError(''), 5000);
    }
  };

  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentData({
      paymentAmount: fee.amountPending.toString(),
      paymentMethod: 'cash',
      transactionId: '',
      remarks: ''
    });
    setFieldErrors({});
    setError('');
    setShowPaymentModal(true);
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      feeType: '',
      totalAmount: '',
      dueDate: '',
      academicYear: new Date().getFullYear().toString(),
      remarks: ''
    });
    setFieldErrors({});
    setError('');
  };

  const resetPaymentForm = () => {
    setPaymentData({
      paymentAmount: '',
      paymentMethod: 'cash',
      transactionId: '',
      remarks: ''
    });
    setFieldErrors({});
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'partial': return 'bg-blue-100 text-blue-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const filteredFees = fees.filter(fee => {
    const studentName = `${fee.student?.user?.firstName} ${fee.student?.user?.lastName}`.toLowerCase();
    const admissionNumber = fee.student?.admissionNumber?.toLowerCase() || '';
    return studentName.includes(searchTerm.toLowerCase()) || admissionNumber.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-yellow-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading fees...</p>
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
          <div className="relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-yellow-500/20 transition-all duration-500 animate-fadeInUp border-2 border-yellow-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-600 via-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow">
                  <FaMoneyBillWave className="text-white text-3xl sm:text-4xl" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2 animate-gradient">
                    Fee Management
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Track and manage student fee payments
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="group flex items-center gap-3 bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 transition-all duration-300 animate-gradient whitespace-nowrap"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <FaPlus className="text-lg" />
                </div>
                <span className="text-sm sm:text-base">Add Fee Record</span>
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-5 shadow-xl flex items-center gap-4 animate-slideInDown">
              <span className="text-2xl">✅</span>
              <p className="text-green-700 font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-xl flex items-center gap-4 animate-slideInDown">
              <span className="text-2xl">❌</span>
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{formatCurrency(stats?.totalCollected || 0)}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Collected</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaExclamationCircle className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{formatCurrency(stats?.totalPending || 0)}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Pending</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaClock className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{stats?.overdueFees || 0}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Overdue</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-2xl" />
                </div>
                <span className="text-3xl font-black">{stats?.totalStudents || 0}</span>
              </div>
              <p className="font-bold text-sm opacity-90">Total Students</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-yellow-100">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-yellow-500 group-hover:scale-110 transition-transform">
                <FaSearch className="text-xl" />
              </div>
              <input
                type="text"
                placeholder="🔍 Search by student name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 focus:outline-none text-base font-semibold transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Fees Table */}
          {filteredFees.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaFileInvoice className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Fee Records Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search' : 'Start by adding a fee record'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <FaPlus />
                  Add First Fee Record
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-yellow-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-yellow-100 to-orange-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-yellow-900 uppercase">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-yellow-900 uppercase">Fee Type</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-yellow-900 uppercase">Total Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-yellow-900 uppercase">Paid</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-yellow-900 uppercase">Pending</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-yellow-900 uppercase">Due Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-yellow-900 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-yellow-900 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-100">
                    {filteredFees.map((fee) => (
                      <tr key={fee._id} className="hover:bg-yellow-50 transition-all">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">
                              {fee.student?.user?.firstName} {fee.student?.user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{fee.student?.admissionNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                            {fee.feeType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">₹{fee.totalAmount}</td>
                        <td className="px-6 py-4 font-bold text-green-600">₹{fee.amountPaid}</td>
                        <td className="px-6 py-4 font-bold text-red-600">₹{fee.amountPending}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-black uppercase ${getStatusColor(fee.status)}`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {fee.status !== 'paid' && (
                              <button
                                onClick={() => openPaymentModal(fee)}
                                className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all"
                                title="Record Payment"
                              >
                                <FaMoneyBillWave />
                              </button>
                            )}
                            {fee.amountPaid === 0 && (
                              <button
                                onClick={() => handleDelete(fee._id)}
                                className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Fee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-yellow-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-yellow-600">Add Fee Record</h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Student <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.studentId 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-200'
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
                      Fee Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="feeType"
                      value={formData.feeType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.feeType 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-200'
                      }`}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Tuition">Tuition Fee</option>
                      <option value="Admission">Admission Fee</option>
                      <option value="Exam">Exam Fee</option>
                      <option value="Transport">Transport Fee</option>
                      <option value="Library">Library Fee</option>
                      <option value="Sports">Sports Fee</option>
                      <option value="Laboratory">Laboratory Fee</option>
                      <option value="Annual">Annual Fee</option>
                      <option value="Other">Other</option>
                    </select>
                    {fieldErrors.feeType && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.feeType}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Total Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.totalAmount 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-200'
                      }`}
                      placeholder="₹"
                      min="1"
                      required
                    />
                    {fieldErrors.totalAmount && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.totalAmount}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.dueDate 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-200'
                      }`}
                      required
                    />
                    {fieldErrors.dueDate && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.dueDate}
                      </p>
                    )}
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 focus:outline-none"
                      rows="2"
                      placeholder="Optional notes"
                    />
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
                    className="flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save Fee Record</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedFee && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 border-4 border-green-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-green-600">Record Payment</h2>
                <button
                  onClick={() => { setShowPaymentModal(false); setSelectedFee(null); resetPaymentForm(); }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Fee Details */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Fee Details:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Student:</strong> {selectedFee.student?.user?.firstName} {selectedFee.student?.user?.lastName}</p>
                  <p><strong>Fee Type:</strong> {selectedFee.feeType}</p>
                  <p><strong>Total Amount:</strong> ₹{selectedFee.totalAmount}</p>
                  <p><strong>Paid:</strong> ₹{selectedFee.amountPaid}</p>
                  <p className="text-lg font-black text-red-600"><strong>Pending:</strong> ₹{selectedFee.amountPending}</p>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-red-700 font-bold">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="paymentAmount"
                    value={paymentData.paymentAmount}
                    onChange={handlePaymentInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                      fieldErrors.paymentAmount 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-green-500 focus:ring-green-200'
                    }`}
                    placeholder="₹"
                    min="1"
                    max={selectedFee.amountPending}
                    required
                  />
                  {fieldErrors.paymentAmount && (
                    <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors.paymentAmount}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handlePaymentInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={paymentData.transactionId}
                    onChange={handlePaymentInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={paymentData.remarks}
                    onChange={handlePaymentInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none"
                    rows="2"
                    placeholder="Payment notes"
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowPaymentModal(false); setSelectedFee(null); resetPaymentForm(); }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaReceipt />
                        <span>Record Payment</span>
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
