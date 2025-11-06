import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaCalendarAlt, FaPlus, FaBell, FaGraduationCap, FaUsers, FaBook,
  FaEdit, FaTrash, FaTimes, FaSave, FaSpinner, FaClock
} from 'react-icons/fa';

export default function Calendar() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [timeFilter, setTimeFilter] = useState('today'); // New state for time filter

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    targetAudience: 'all',
    color: 'blue'
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token, fetchEvents]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Event title is required';
        return '';
      case 'eventType':
        if (!value) return 'Event type is required';
        return '';
      case 'startDate':
        if (!value) return 'Start date is required';
        return '';
      case 'endDate':
        if (!value) return 'End date is required';
        if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
          return 'End date must be after start date';
        }
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
    if (!formData.title.trim()) errors.push('Event title is required');
    if (!formData.eventType) errors.push('Event type is required');
    if (!formData.startDate) errors.push('Start date is required');
    if (!formData.endDate) errors.push('End date is required');
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.push('End date must be after start date');
    }
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
      await axios.post('/api/admin/events', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Event created successfully!');
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
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
      await axios.put(`/api/admin/events/${editingEvent._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Event updated successfully!');
      setShowEditModal(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`/api/admin/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      eventType: event.eventType || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      targetAudience: event.targetAudience || 'all',
      color: event.color || 'blue'
    });
    setFieldErrors({});
    setError('');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventType: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      targetAudience: 'all',
      color: 'blue'
    });
    setFieldErrors({});
    setError('');
  };

  const getEventTypeColor = (type) => {
    const colors = {
      holiday: 'from-red-500 to-rose-500',
      exam: 'from-orange-500 to-red-500',
      meeting: 'from-blue-500 to-cyan-500',
      sports: 'from-green-500 to-emerald-500',
      cultural: 'from-purple-500 to-pink-500',
      academic: 'from-indigo-500 to-blue-500',
      other: 'from-gray-500 to-slate-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const getEventIcon = (type) => {
    const icons = {
      holiday: FaBell,
      exam: FaBook,
      meeting: FaUsers,
      sports: FaGraduationCap,
      cultural: FaBell,
      academic: FaBook,
      other: FaCalendarAlt
    };
    return icons[type] || FaCalendarAlt;
  };

  // Filter events based on selected time period
  const getFilteredEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      switch(timeFilter) {
        case 'today':
          // Events that occur today
          return eventStart <= today && eventEnd >= today;
          
        case 'week':
          // Events within the next 7 days
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return eventStart <= weekEnd && eventEnd >= today;
          
        case 'month':
          // Events within this month
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          return (eventStart <= monthEnd && eventEnd >= monthStart);
          
        case 'year':
          // Events within this year
          const yearStart = new Date(now.getFullYear(), 0, 1);
          const yearEnd = new Date(now.getFullYear(), 11, 31);
          return (eventStart <= yearEnd && eventEnd >= yearStart);
          
        default:
          return true;
      }
    });
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-cyan-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading events...</p>
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
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-cyan-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <FaCalendarAlt className="text-white text-3xl sm:text-4xl" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    School Calendar
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base font-semibold">
                    Manage events, holidays, and important dates
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <FaPlus />
                Add Event
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

          {/* Time Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Welcome back! Here&apos;s what&apos;s happening today.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
                    timeFilter === 'today'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
                    timeFilter === 'week'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
                    timeFilter === 'month'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeFilter('year')}
                  className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 ${
                    timeFilter === 'year'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>

          {/* Events List */}
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-6">
                {events.length === 0 
                  ? 'Start by adding your first event' 
                  : `No events scheduled for this ${timeFilter === 'today' ? 'day' : timeFilter}`
                }
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <FaPlus />
                {events.length === 0 ? 'Add First Event' : 'Add New Event'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600 font-semibold">
                  Showing <span className="text-cyan-600 font-bold">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'event' : 'events'}
                  {timeFilter === 'today' && ' today'}
                  {timeFilter === 'week' && ' this week'}
                  {timeFilter === 'month' && ' this month'}
                  {timeFilter === 'year' && ' this year'}
                </p>
                {filteredEvents.length < events.length && (
                  <p className="text-sm text-gray-500">
                    ({events.length} total events)
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                const EventIcon = getEventIcon(event.eventType);
                return (
                  <div
                    key={event._id}
                    className={`group bg-gradient-to-br ${getEventTypeColor(event.eventType)} rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <EventIcon className="text-2xl" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-black mb-2">{event.title}</h3>
                    <p className="text-sm opacity-90 mb-4">{event.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FaCalendarAlt />
                        <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                      </div>
                      {event.startTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaClock />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="text-sm opacity-90">📍 {event.location}</div>
                      )}
                      <div className="pt-2">
                        <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-bold uppercase">
                          {event.eventType}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* Add Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-cyan-200 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-cyan-600">Add New Event</h2>
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
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.title 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-200'
                      }`}
                      placeholder="e.g., Annual Sports Day"
                      required
                    />
                    {fieldErrors.title && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {fieldErrors.title}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 focus:outline-none"
                      rows="2"
                      placeholder="Event description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.eventType 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-200'
                      }`}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="holiday">Holiday</option>
                      <option value="exam">Exam</option>
                      <option value="meeting">Meeting</option>
                      <option value="sports">Sports</option>
                      <option value="cultural">Cultural</option>
                      <option value="academic">Academic</option>
                      <option value="other">Other</option>
                    </select>
                    {fieldErrors.eventType && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {fieldErrors.eventType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 focus:outline-none"
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="staff">Staff</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.startDate 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-200'
                      }`}
                      required
                    />
                    {fieldErrors.startDate && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {fieldErrors.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        fieldErrors.endDate 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-200'
                      }`}
                      required
                    />
                    {fieldErrors.endDate && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {fieldErrors.endDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 focus:outline-none"
                      placeholder="Event location"
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
                    className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save Event</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Event Modal - Same structure as Add, but pre-filled */}
        {showEditModal && editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-4 border-blue-200 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-blue-600">Edit Event</h2>
                <button
                  onClick={() => { setShowEditModal(false); setEditingEvent(null); resetForm(); }}
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="holiday">Holiday</option>
                      <option value="exam">Exam</option>
                      <option value="meeting">Meeting</option>
                      <option value="sports">Sports</option>
                      <option value="cultural">Cultural</option>
                      <option value="academic">Academic</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="staff">Staff</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none"
                      placeholder="Event location"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingEvent(null); resetForm(); }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
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
                        <span>Update Event</span>
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
