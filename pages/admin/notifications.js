import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaBell, FaPlus, FaUsers, FaPaperPlane, FaCheckCircle, 
  FaExclamationCircle, FaInfoCircle, FaTimes, FaSave, FaSpinner
} from 'react-icons/fa';

export default function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    recipients: 'all'
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.trim().length < 3) return 'Must be at least 3 characters';
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Must be at least 10 characters';
        return '';
      case 'type':
        if (!value) return 'Type is required';
        return '';
      case 'priority':
        if (!value) return 'Priority is required';
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

  const validateForm = () => {
    const errors = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (formData.title.trim().length < 3) errors.push('Title must be at least 3 characters');
    if (!formData.message.trim()) errors.push('Message is required');
    if (formData.message.trim().length < 10) errors.push('Message must be at least 10 characters');
    if (!formData.type) errors.push('Type is required');
    if (!formData.priority) errors.push('Priority is required');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('. '));
      setSubmitting(false);
      return;
    }

    try {
      await axios.post('/api/admin/notifications', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Notification sent successfully!');
      setShowModal(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'general',
      priority: 'medium',
      recipients: 'all'
    });
    setFieldErrors({});
    setError('');
  };

  const getNotificationIcon = (type) => {
    const icons = {
      announcement: FaBell,
      urgent: FaExclamationCircle,
      general: FaInfoCircle,
      fee: FaInfoCircle,
      attendance: FaCheckCircle
    };
    return icons[type] || FaBell;
  };

  const getNotificationColor = (priority) => {
    const colors = {
      urgent: 'from-red-500 to-rose-500',
      high: 'from-orange-500 to-red-500',
      medium: 'from-blue-500 to-cyan-500',
      low: 'from-gray-500 to-slate-500'
    };
    return colors[priority] || 'from-blue-500 to-cyan-500';
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-yellow-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading notifications...</p>
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
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-yellow-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-600 via-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow">
                  <FaBell className="text-white text-3xl sm:text-4xl" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                    Notifications
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base font-semibold">
                    Send announcements and alerts to students and parents
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <FaPlus />
                New Notification
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaPaperPlane className="text-3xl" />
                <span className="text-3xl font-black">{stats?.sentToday || 0}</span>
              </div>
              <p className="font-bold opacity-90">Sent Today</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaBell className="text-3xl" />
                <span className="text-3xl font-black">{stats?.totalNotifications || 0}</span>
              </div>
              <p className="font-bold opacity-90">Total Notifications</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaUsers className="text-3xl" />
                <span className="text-3xl font-black">{stats?.totalUsers || 0}</span>
              </div>
              <p className="font-bold opacity-90">Total Users</p>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Notifications Found</h3>
              <p className="text-gray-600 mb-6">Start by sending your first notification</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <FaPlus />
                Send First Notification
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification._id}
                    className={`bg-gradient-to-r ${getNotificationColor(notification.priority)} rounded-2xl shadow-2xl p-6 text-white`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <NotificationIcon className="text-2xl" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-black">{notification.title}</h3>
                            <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-bold uppercase">
                              {notification.priority}
                            </span>
                          </div>
                          <p className="mb-3 opacity-90">{notification.message}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full font-bold">
                              {notification.type}
                            </span>
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full font-bold">
                              To: {notification.recipients}
                            </span>
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full font-bold">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Notification Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-yellow-200 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-yellow-600">Send Notification</h2>
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

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                      fieldErrors.title 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-200'
                    }`}
                    placeholder="e.g., School Holiday Announcement"
                    required
                  />
                  {fieldErrors.title && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {fieldErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                      fieldErrors.message 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-200'
                    }`}
                    rows="4"
                    placeholder="Enter your notification message..."
                    required
                  />
                  {fieldErrors.message && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {fieldErrors.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 focus:outline-none"
                      required
                    >
                      <option value="general">General</option>
                      <option value="announcement">Announcement</option>
                      <option value="event">Event</option>
                      <option value="fee">Fee</option>
                      <option value="grade">Grade</option>
                      <option value="attendance">Attendance</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 focus:outline-none"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Recipients <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="recipients"
                      value={formData.recipients}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 focus:outline-none"
                      required
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="staff">Staff</option>
                      <option value="parents">Parents</option>
                      <option value="admin">Admin</option>
                    </select>
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
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Send Notification</span>
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
