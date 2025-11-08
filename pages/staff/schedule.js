import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaClock, FaSpinner, FaChalkboard, FaBook, FaMapMarkerAlt, FaCalendarAlt, 
  FaUsers, FaPrint, FaDownload, FaExclamationTriangle, FaInfoCircle,
  FaFilter, FaCheckCircle, FaCoffee, FaChartBar
} from 'react-icons/fa';

export default function Schedule() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [filterSubject, setFilterSubject] = useState('all');
  const [error, setError] = useState(null);

  const weekDays = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);

  useEffect(() => {
    // Set today's day as selected
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    if (today !== 'Sunday' && weekDays.includes(today)) {
      setSelectedDay(today);
    }
  }, [weekDays]);

  useEffect(() => {
    if (token) {
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/staff/schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch schedule');
      }
      
      setScheduleData(response.data.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load schedule');
      toast.error('Failed to load schedule. Please try again.', { duration: 5000 });
    } finally {
      setLoading(false);
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

  const getUniqueSubjects = useCallback(() => {
    if (!scheduleData?.weeklySchedule) return [];
    const subjects = new Set();
    Object.values(scheduleData.weeklySchedule).forEach(daySchedule => {
      daySchedule.forEach(period => {
        if (period.subject) subjects.add(period.subject);
      });
    });
    return Array.from(subjects).sort();
  }, [scheduleData]);

  const getFilteredPeriods = useCallback((day) => {
    if (!scheduleData?.weeklySchedule?.[day]) return [];
    const periods = scheduleData.weeklySchedule[day];
    
    if (filterSubject === 'all') return periods;
    return periods.filter(period => period.subject === filterSubject);
  }, [scheduleData, filterSubject]);

  const getWeeklyStats = useCallback(() => {
    if (!scheduleData?.weeklySchedule) return { totalPeriods: 0, totalHours: 0, periodsPerDay: {} };
    
    let totalPeriods = 0;
    let totalMinutes = 0;
    const periodsPerDay = {};

    Object.entries(scheduleData.weeklySchedule).forEach(([day, periods]) => {
      periodsPerDay[day] = periods.length;
      totalPeriods += periods.length;
      
      // Calculate duration for each period
      periods.forEach(period => {
        if (period.startTime && period.endTime) {
          const [startHour, startMin] = period.startTime.split(':').map(Number);
          const [endHour, endMin] = period.endTime.split(':').map(Number);
          const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
          totalMinutes += duration;
        }
      });
    });

    return {
      totalPeriods,
      totalHours: (totalMinutes / 60).toFixed(1),
      periodsPerDay,
      busiestDay: Object.entries(periodsPerDay).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0]
    };
  }, [scheduleData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!scheduleData) return;
    
    let csvContent = 'Day,Period,Time,Subject,Class,Room\n';
    
    weekDays.forEach(day => {
      const periods = scheduleData.weeklySchedule?.[day] || [];
      periods.forEach(period => {
        csvContent += `${day},${period.periodNumber},${period.startTime}-${period.endTime},${period.subject},${period.className},${period.room}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Schedule exported successfully!');
  };

  const stats = getWeeklyStats();
  const uniqueSubjects = getUniqueSubjects();
  const filteredPeriods = getFilteredPeriods(selectedDay);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading your schedule...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
              <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Schedule</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchSchedule}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!scheduleData) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Schedule Data</h3>
              <p className="text-gray-600">Unable to load schedule information</p>
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl">
                  <FaClock className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-black">My Schedule</h1>
                  <p className="text-purple-100 font-semibold">Weekly timetable and class schedule</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                  title="Print Schedule"
                >
                  <FaPrint />
                  Print
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                  title="Export as CSV"
                >
                  <FaDownload />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Staff Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{scheduleData.staff.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-bold text-purple-600">{scheduleData.staff.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-bold text-gray-900">{scheduleData.staff.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Designation:</span>
                    <span className="font-bold text-gray-900">{scheduleData.staff.designation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Schedule Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your weekly schedule is displayed below organized by day</li>
                  <li>• Click on any day tab to view that day&apos;s classes</li>
                  <li>• Use the subject filter to view specific subject classes</li>
                  <li>• Print or export your schedule for offline reference</li>
                  <li>• Schedule is automatically generated from class timetables</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Weekly Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaBook className="text-3xl" />
                <span className="text-4xl font-black">{stats.totalPeriods}</span>
              </div>
              <p className="font-bold text-lg">Total Periods</p>
              <p className="text-blue-100 text-sm">This week</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaClock className="text-3xl" />
                <span className="text-4xl font-black">{stats.totalHours}h</span>
              </div>
              <p className="font-bold text-lg">Teaching Hours</p>
              <p className="text-green-100 text-sm">Per week</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaChalkboard className="text-3xl" />
                <span className="text-4xl font-black">{scheduleData.totalClasses}</span>
              </div>
              <p className="font-bold text-lg">Total Classes</p>
              <p className="text-purple-100 text-sm">Assigned</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaChartBar className="text-3xl" />
                <span className="text-4xl font-black">{stats.busiestDay ? stats.busiestDay.substring(0, 3) : '-'}</span>
              </div>
              <p className="font-bold text-lg">Busiest Day</p>
              <p className="text-orange-100 text-sm">{stats.periodsPerDay[stats.busiestDay] || 0} periods</p>
            </div>
          </div>

          {/* Filters */}
          {uniqueSubjects.length > 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-purple-600" />
                <h3 className="text-lg font-black">Filter by Subject</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterSubject('all')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    filterSubject === 'all'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Subjects
                </button>
                {uniqueSubjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => setFilterSubject(subject)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      filterSubject === subject
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day Tabs */}
          <div className="bg-white rounded-2xl shadow-xl p-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {weekDays.map(day => {
                const periodsCount = scheduleData.weeklySchedule?.[day]?.length || 0;
                const filteredCount = getFilteredPeriods(day).length;
                const displayCount = filterSubject === 'all' ? periodsCount : filteredCount;
                
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
                      <div className={`text-xs mt-1 ${selectedDay === day ? 'opacity-90' : 'opacity-70'}`}>
                        {displayCount} {displayCount === 1 ? 'period' : 'periods'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Schedule */}
          {filteredPeriods.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              {filterSubject === 'all' ? (
                <>
                  <FaCoffee className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-bold text-gray-900 mb-2">No Classes on {selectedDay}</p>
                  <p className="text-gray-600">You have a free day! Enjoy your break.</p>
                </>
              ) : (
                <>
                  <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-bold text-gray-900 mb-2">No {filterSubject} Classes on {selectedDay}</p>
                  <p className="text-gray-600 mb-4">You don&apos;t teach {filterSubject} on this day.</p>
                  <button
                    onClick={() => setFilterSubject('all')}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    View all subjects
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`bg-gradient-to-r ${getDayColor(selectedDay)} rounded-2xl p-6 text-white`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <FaCalendarAlt />
                    {selectedDay}&apos;s Schedule
                    {filterSubject !== 'all' && ` - ${filterSubject}`}
                  </h2>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <FaCheckCircle />
                    <span className="font-bold">{filteredPeriods.length} periods today</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPeriods.map((period, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 bg-gradient-to-br ${getDayColor(selectedDay)} rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                          {period.periodNumber}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">{period.subject}</h3>
                          {period.subjectCode && (
                            <p className="text-sm text-gray-500 font-semibold">{period.subjectCode}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-purple-600 font-bold">
                          <FaClock />
                          <span className="text-sm">{period.startTime}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-semibold">to {period.endTime}</div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t-2 border-gray-100 pt-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FaChalkboard className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Class</p>
                          <p className="font-bold">
                            {period.className} - Grade {period.grade}{period.section}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <FaMapMarkerAlt className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Location</p>
                          <p className="font-bold">Room {period.room}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class List Summary */}
          {scheduleData.classList && scheduleData.classList.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <FaUsers className="text-purple-600" />
                My Classes ({scheduleData.classList.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduleData.classList.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-black text-gray-900">{item.className}</h3>
                      <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                        <FaChalkboard className="text-purple-700" />
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-semibold">Grade:</span>
                        <span className="font-bold text-gray-900">
                          {item.grade} - Section {item.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaMapMarkerAlt className="text-purple-600" />
                        <span className="font-bold">Room {item.room}</span>
                      </div>
                      {item.subjects && (
                        <div className="pt-2 border-t border-purple-200">
                          <p className="text-xs text-gray-500 mb-1">Subjects:</p>
                          <p className="text-xs font-semibold text-gray-700">{item.subjects}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
