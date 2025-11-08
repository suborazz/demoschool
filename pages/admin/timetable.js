import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaClock, FaSpinner, FaChalkboard, FaPlus, FaTrash, 
  FaSave, FaCalendarAlt, FaUserTie, FaBook, FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

export default function TimetableManagement() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [availableStaff, setAvailableStaff] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (token) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async (classId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/timetable?classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data.data;
      setTimetableData(data.class);
      setAvailableStaff(data.availableStaff || []);
      setAvailableSubjects(data.availableSubjects || []);

      // Initialize empty timetable if none exists
      if (!data.class.timetable || data.class.timetable.length === 0) {
        const emptyTimetable = weekDays.map(day => ({
          day,
          periods: []
        }));
        setTimetableData({ ...data.class, timetable: emptyTimetable });
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    fetchTimetable(classId);
  };

  const getDaySchedule = (day) => {
    if (!timetableData?.timetable) return { day, periods: [] };
    const daySchedule = timetableData.timetable.find(d => d.day === day);
    return daySchedule || { day, periods: [] };
  };

  const addPeriod = () => {
    const daySchedule = getDaySchedule(selectedDay);
    const newPeriod = {
      periodNumber: (daySchedule.periods.length + 1),
      subject: '',
      teacher: '',
      startTime: '',
      endTime: ''
    };

    const updatedTimetable = timetableData.timetable.map(d => {
      if (d.day === selectedDay) {
        return { ...d, periods: [...d.periods, newPeriod] };
      }
      return d;
    });

    // If day doesn't exist, add it
    if (!updatedTimetable.find(d => d.day === selectedDay)) {
      updatedTimetable.push({ day: selectedDay, periods: [newPeriod] });
    }

    setTimetableData({ ...timetableData, timetable: updatedTimetable });
  };

  const removePeriod = (periodIndex) => {
    const updatedTimetable = timetableData.timetable.map(d => {
      if (d.day === selectedDay) {
        const updatedPeriods = d.periods.filter((_, idx) => idx !== periodIndex);
        // Renumber periods
        return {
          ...d,
          periods: updatedPeriods.map((p, idx) => ({ ...p, periodNumber: idx + 1 }))
        };
      }
      return d;
    });

    setTimetableData({ ...timetableData, timetable: updatedTimetable });
  };

  const updatePeriod = (periodIndex, field, value) => {
    // Clear field error when user updates
    const errorKey = `${selectedDay}-${periodIndex}-${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

    const updatedTimetable = timetableData.timetable.map(d => {
      if (d.day === selectedDay) {
        return {
          ...d,
          periods: d.periods.map((p, idx) => {
            if (idx === periodIndex) {
              return { ...p, [field]: value };
            }
            return p;
          })
        };
      }
      return d;
    });

    setTimetableData({ ...timetableData, timetable: updatedTimetable });
  };

  const validateTimetable = () => {
    const errors = [];
    const newFieldErrors = {};
    
    for (const day of timetableData.timetable) {
      for (let periodIdx = 0; periodIdx < day.periods.length; periodIdx++) {
        const period = day.periods[periodIdx];
        
        // Required fields validation
        if (!period.subject) {
          const errorKey = `${day.day}-${periodIdx}-subject`;
          newFieldErrors[errorKey] = 'Subject is required';
          errors.push(`${day.day} Period ${period.periodNumber}: Subject is required`);
        }
        
        if (!period.teacher) {
          const errorKey = `${day.day}-${periodIdx}-teacher`;
          newFieldErrors[errorKey] = 'Teacher is required';
          errors.push(`${day.day} Period ${period.periodNumber}: Teacher is required`);
        }
        
        // Time validation
        if (period.startTime && period.endTime) {
          if (period.endTime <= period.startTime) {
            const errorKey = `${day.day}-${periodIdx}-endTime`;
            newFieldErrors[errorKey] = 'Must be after start time';
            errors.push(`${day.day} Period ${period.periodNumber}: End time must be after start time`);
          }
        }
        
        // If one time is filled, both should be filled
        if (period.startTime && !period.endTime) {
          const errorKey = `${day.day}-${periodIdx}-endTime`;
          newFieldErrors[errorKey] = 'End time is required when start time is set';
          errors.push(`${day.day} Period ${period.periodNumber}: End time is required when start time is set`);
        }
        if (period.endTime && !period.startTime) {
          const errorKey = `${day.day}-${periodIdx}-startTime`;
          newFieldErrors[errorKey] = 'Start time is required when end time is set';
          errors.push(`${day.day} Period ${period.periodNumber}: Start time is required when end time is set`);
        }
      }
      
      // Check for time overlaps on the same day
      const periodsWithTime = day.periods.filter(p => p.startTime && p.endTime);
      for (let i = 0; i < periodsWithTime.length; i++) {
        for (let j = i + 1; j < periodsWithTime.length; j++) {
          const p1 = periodsWithTime[i];
          const p2 = periodsWithTime[j];
          
          // Check if times overlap
          if ((p1.startTime < p2.endTime && p1.endTime > p2.startTime)) {
            errors.push(`${day.day}: Period ${p1.periodNumber} and Period ${p2.periodNumber} have overlapping times`);
          }
        }
      }
    }
    
    setFieldErrors(newFieldErrors);
    return errors;
  };

  const saveTimetable = async () => {
    try {
      setSaving(true);

      // Validate
      const validationErrors = validateTimetable();
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]); // Show first error
        setSaving(false);
        return;
      }

      await axios.put('/api/admin/timetable', {
        classId: selectedClass,
        timetable: timetableData.timetable
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Timetable saved successfully!');
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast.error(error.response?.data?.message || 'Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  const clearTimetable = async () => {
    if (!confirm('Are you sure you want to clear the entire timetable? This cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/timetable?classId=${selectedClass}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Timetable cleared');
      fetchTimetable(selectedClass);
    } catch (error) {
      console.error('Error clearing timetable:', error);
      toast.error('Failed to clear timetable');
    }
  };

  const getDayColor = (day) => {
    const colors = {
      'Monday': 'from-blue-500 to-blue-600',
      'Tuesday': 'from-green-500 to-green-600',
      'Wednesday': 'from-yellow-500 to-yellow-600',
      'Thursday': 'from-purple-500 to-purple-600',
      'Friday': 'from-pink-500 to-pink-600',
      'Saturday': 'from-orange-500 to-orange-600'
    };
    return colors[day] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-purple-600 animate-spin" />
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaClock className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Timetable Management
                </h1>
                <p className="text-gray-600 font-semibold">Create and manage class timetables</p>
              </div>
            </div>
          </div>

          {/* Class Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <label className="block text-lg font-bold text-gray-900 mb-3">
              <FaChalkboard className="inline mr-2 text-purple-600" />
              Select Class
            </label>
            <select
              value={selectedClass || ''}
              onChange={(e) => handleClassSelect(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
            >
              <option value="">-- Choose a class --</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - Grade {cls.grade} {cls.section}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && timetableData && (
            <>
              {/* Day Tabs */}
              <div className="bg-white rounded-2xl shadow-xl p-4 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {weekDays.map(day => {
                    const periodsCount = getDaySchedule(day).periods.length;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all ${
                          selectedDay === day
                            ? `bg-gradient-to-r ${getDayColor(day)} text-white shadow-lg scale-105`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg">{day}</div>
                          <div className="text-xs mt-1 opacity-80">
                            {periodsCount} {periodsCount === 1 ? 'period' : 'periods'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Management */}
              <div className="space-y-4">
                <div className={`bg-gradient-to-r ${getDayColor(selectedDay)} rounded-2xl p-4 text-white flex items-center justify-between`}>
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <FaCalendarAlt />
                    {selectedDay} - Period Management
                  </h2>
                  <button
                    onClick={addPeriod}
                    className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <FaPlus />
                    Add Period
                  </button>
                </div>

                {/* Periods List */}
                {getDaySchedule(selectedDay).periods.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                    <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-900 mb-2">No Periods Added</p>
                    <p className="text-gray-600 mb-4">Click &quot;Add Period&quot; to create a period for this day</p>
                    <button
                      onClick={addPeriod}
                      className={`bg-gradient-to-r ${getDayColor(selectedDay)} text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all`}
                    >
                      <FaPlus className="inline mr-2" />
                      Add First Period
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getDaySchedule(selectedDay).periods.map((period, index) => (
                      <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getDayColor(selectedDay)} rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                            {period.periodNumber}
                          </div>
                          <button
                            onClick={() => removePeriod(index)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Subject */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              <FaBook className="inline mr-1 text-purple-600" />
                              Subject *
                            </label>
                            <select
                              value={period.subject?._id || period.subject || ''}
                              onChange={(e) => updatePeriod(index, 'subject', e.target.value)}
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 transition-all ${
                                fieldErrors[`${selectedDay}-${index}-subject`]
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                              }`}
                              required
                            >
                              <option value="">Select Subject</option>
                              {availableSubjects.map(subject => (
                                <option key={subject._id} value={subject._id}>
                                  {subject.name} ({subject.code})
                                </option>
                              ))}
                            </select>
                            {fieldErrors[`${selectedDay}-${index}-subject`] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <FaExclamationTriangle /> {fieldErrors[`${selectedDay}-${index}-subject`]}
                              </p>
                            )}
                          </div>

                          {/* Teacher */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              <FaUserTie className="inline mr-1 text-green-600" />
                              Teacher *
                            </label>
                            <select
                              value={period.teacher?._id || period.teacher || ''}
                              onChange={(e) => updatePeriod(index, 'teacher', e.target.value)}
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 transition-all ${
                                fieldErrors[`${selectedDay}-${index}-teacher`]
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                              }`}
                              required
                            >
                              <option value="">Select Teacher</option>
                              {availableStaff.map(staff => (
                                <option key={staff._id} value={staff._id}>
                                  {staff.user?.firstName} {staff.user?.lastName} - {staff.employeeId}
                                </option>
                              ))}
                            </select>
                            {fieldErrors[`${selectedDay}-${index}-teacher`] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <FaExclamationTriangle /> {fieldErrors[`${selectedDay}-${index}-teacher`]}
                              </p>
                            )}
                          </div>

                          {/* Start Time */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              <FaClock className="inline mr-1 text-blue-600" />
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={period.startTime || ''}
                              onChange={(e) => updatePeriod(index, 'startTime', e.target.value)}
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 transition-all ${
                                fieldErrors[`${selectedDay}-${index}-startTime`]
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                              }`}
                            />
                            {fieldErrors[`${selectedDay}-${index}-startTime`] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <FaExclamationTriangle /> {fieldErrors[`${selectedDay}-${index}-startTime`]}
                              </p>
                            )}
                          </div>

                          {/* End Time */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              <FaClock className="inline mr-1 text-blue-600" />
                              End Time
                            </label>
                            <input
                              type="time"
                              value={period.endTime || ''}
                              onChange={(e) => updatePeriod(index, 'endTime', e.target.value)}
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 transition-all ${
                                fieldErrors[`${selectedDay}-${index}-endTime`]
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                              }`}
                            />
                            {fieldErrors[`${selectedDay}-${index}-endTime`] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <FaExclamationTriangle /> {fieldErrors[`${selectedDay}-${index}-endTime`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={saveTimetable}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Timetable
                    </>
                  )}
                </button>
                <button
                  onClick={clearTimetable}
                  className="bg-red-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2"
                >
                  <FaTrash />
                  Clear All
                </button>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

