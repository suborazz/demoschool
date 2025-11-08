import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { FaClock, FaSpinner, FaChalkboard, FaBook, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';

export default function Schedule() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');

  useEffect(() => {
    if (token) {
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    // Set today's day as selected
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    if (today !== 'Sunday') {
      setSelectedDay(today);
    }
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScheduleData(response.data.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-purple-600 animate-spin" />
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaClock className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Schedule
                </h1>
                <p className="text-gray-600 font-semibold">Weekly timetable and class schedule</p>
              </div>
            </div>
          </div>

          {/* Staff Info Card */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">{scheduleData?.staff.name}</h3>
                <p className="text-sm opacity-90">Employee ID: {scheduleData?.staff.employeeId}</p>
                <p className="text-sm opacity-90">Department: {scheduleData?.staff.department}</p>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                  <p className="text-3xl font-black">{scheduleData?.totalClasses || 0}</p>
                  <p className="text-sm opacity-90">Total Classes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="bg-white rounded-2xl shadow-xl p-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {weekDays.map(day => {
                const periodsCount = scheduleData?.weeklySchedule?.[day]?.length || 0;
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

          {/* Selected Day Schedule */}
          {scheduleData?.weeklySchedule?.[selectedDay]?.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Classes on {selectedDay}</p>
              <p className="text-gray-600">You have a free day!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`bg-gradient-to-r ${getDayColor(selectedDay)} rounded-2xl p-4 text-white`}>
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <FaCalendarAlt />
                  {selectedDay}&apos;s Schedule
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {scheduleData?.weeklySchedule?.[selectedDay]?.map((period, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getDayColor(selectedDay)} rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg`}>
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
                        <div className="text-xs text-gray-500">to {period.endTime}</div>
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaChalkboard className="text-purple-600" />
                        <span className="font-semibold">
                          {period.className} - Grade {period.grade}{period.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaMapMarkerAlt className="text-green-600" />
                        <span className="font-semibold">Room {period.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class List Summary */}
          {scheduleData?.classList && scheduleData.classList.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <FaUsers className="text-purple-600" />
                My Classes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduleData.classList.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-all"
                  >
                    <h3 className="text-lg font-black text-gray-900 mb-1">{item.className}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Grade {item.grade} - Section {item.section}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FaMapMarkerAlt className="text-purple-600" />
                      <span>Room {item.room}</span>
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

