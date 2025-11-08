import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaClock, FaSpinner, FaBook, FaUserTie, 
  FaCalendarAlt, FaMapMarkerAlt, FaPrint, FaUserGraduate
} from 'react-icons/fa';

export default function ParentTimetable() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const weekDays = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);

  useEffect(() => {
    // Set today's day as default
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (dayIndex >= 1 && dayIndex <= 6) {
      setSelectedDay(weekDays[dayIndex - 1]);
    }
  }, [weekDays]);

  useEffect(() => {
    if (token) {
      fetchChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedChild) {
      fetchTimetable(selectedChild);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/parent/children', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const childrenData = response.data.data || [];
      setChildren(childrenData);
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0]._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children data');
      setLoading(false);
    }
  };

  const fetchTimetable = async (studentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/parent/timetable?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimetableData(response.data.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getDaySchedule = (day) => {
    if (!timetableData?.timetable) return { day, periods: [] };
    const daySchedule = timetableData.timetable.find(d => d.day === day);
    return daySchedule || { day, periods: [] };
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

  const handlePrint = () => {
    window.print();
  };

  const getSelectedChildInfo = () => {
    return children.find(child => child._id === selectedChild);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['parent']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-purple-600 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (children.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['parent']}>
        <DashboardLayout>
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FaUserGraduate className="text-8xl text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-gray-900 mb-4">No Children Found</h2>
            <p className="text-gray-600 text-lg">
              No student records are linked to your account. Please contact the school administration.
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const childInfo = getSelectedChildInfo();

  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaClock className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Class Timetable
                  </h1>
                  <p className="text-gray-600 font-semibold">View your child&apos;s schedule</p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <FaPrint />
                Print
              </button>
            </div>
          </div>

          {/* Child Selection */}
          {children.length > 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <label className="block text-lg font-bold text-gray-900 mb-3">
                <FaUserGraduate className="inline mr-2 text-purple-600" />
                Select Child
              </label>
              <select
                value={selectedChild || ''}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
              >
                {children.map(child => (
                  <option key={child._id} value={child._id}>
                    {child.user?.firstName} {child.user?.lastName} - {child.rollNumber} - {child.class?.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current Child Info */}
          {childInfo && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaUserGraduate className="text-3xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">
                    {childInfo.user?.firstName} {childInfo.user?.lastName}
                  </h2>
                  <p className="text-white text-opacity-90 font-semibold">
                    Roll No: {childInfo.rollNumber} | {timetableData?.name} - Grade {timetableData?.grade} {timetableData?.section}
                  </p>
                </div>
              </div>
            </div>
          )}

          {timetableData && timetableData.timetable && timetableData.timetable.length > 0 ? (
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

              {/* Selected Day Schedule */}
              <div className="space-y-4">
                <div className={`bg-gradient-to-r ${getDayColor(selectedDay)} rounded-2xl p-4 text-white`}>
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <FaCalendarAlt />
                    {selectedDay}&apos;s Schedule
                  </h2>
                </div>

                {getDaySchedule(selectedDay).periods.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                    <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-900 mb-2">No Classes</p>
                    <p className="text-gray-600">No classes scheduled for {selectedDay}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getDaySchedule(selectedDay).periods
                      .sort((a, b) => a.periodNumber - b.periodNumber)
                      .map((period, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-all">
                          <div className="flex items-start gap-4">
                            {/* Period Number */}
                            <div className={`w-16 h-16 bg-gradient-to-br ${getDayColor(selectedDay)} rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg flex-shrink-0`}>
                              {period.periodNumber}
                            </div>

                            {/* Period Details */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Subject */}
                              <div>
                                <div className="flex items-center gap-2 text-purple-600 font-bold mb-1">
                                  <FaBook />
                                  <span className="text-sm">Subject</span>
                                </div>
                                <p className="text-gray-900 font-semibold text-lg">
                                  {period.subject?.name || 'N/A'}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {period.subject?.code || ''}
                                </p>
                              </div>

                              {/* Teacher */}
                              <div>
                                <div className="flex items-center gap-2 text-green-600 font-bold mb-1">
                                  <FaUserTie />
                                  <span className="text-sm">Teacher</span>
                                </div>
                                <p className="text-gray-900 font-semibold">
                                  {period.teacher?.user?.firstName} {period.teacher?.user?.lastName}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {period.teacher?.employeeId}
                                </p>
                              </div>

                              {/* Time */}
                              <div>
                                <div className="flex items-center gap-2 text-blue-600 font-bold mb-1">
                                  <FaClock />
                                  <span className="text-sm">Time</span>
                                </div>
                                {period.startTime && period.endTime ? (
                                  <p className="text-gray-900 font-semibold">
                                    {period.startTime} - {period.endTime}
                                  </p>
                                ) : (
                                  <p className="text-gray-500 text-sm">Time not set</p>
                                )}
                              </div>

                              {/* Room */}
                              <div>
                                <div className="flex items-center gap-2 text-orange-600 font-bold mb-1">
                                  <FaMapMarkerAlt />
                                  <span className="text-sm">Room</span>
                                </div>
                                <p className="text-gray-900 font-semibold">
                                  {period.room || 'Not assigned'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Weekly Overview */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-purple-600" />
                  Weekly Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {weekDays.map(day => {
                    const daySchedule = getDaySchedule(day);
                    const periodsCount = daySchedule.periods.length;
                    return (
                      <div key={day} className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all">
                        <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${getDayColor(day)} rounded-full flex items-center justify-center text-white font-bold text-xl mb-2`}>
                          {periodsCount}
                        </div>
                        <p className="font-bold text-gray-900">{day}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {periodsCount === 0 ? 'No classes' : `${periodsCount} ${periodsCount === 1 ? 'period' : 'periods'}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <FaCalendarAlt className="text-8xl text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-gray-900 mb-4">No Timetable Available</h2>
              <p className="text-gray-600 text-lg">
                The class timetable hasn&apos;t been created yet. Please contact the school administration.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

