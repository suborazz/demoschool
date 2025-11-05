import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { 
  FaClipboardCheck, FaCalendarAlt, FaUsers, FaCheckCircle, 
  FaTimesCircle, FaSpinner, FaSave, FaTimes
} from 'react-icons/fa';

export default function Attendance() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState({});
  const [stats, setStats] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const classesData = response.data.data || [];
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, [token]);

  const fetchAttendanceStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/attendance', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate }
      });
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  }, [token, selectedDate]);

  const fetchStudentsByClass = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allStudents = response.data.students || response.data.data || [];
      const filtered = allStudents.filter(s => s.class?._id === selectedClass);
      setStudents(filtered);
      
      // Initialize attendance
      const initialAttendance = {};
      filtered.forEach(student => {
        initialAttendance[student._id] = 'present'; // Default to present
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, [token, selectedClass]);

  useEffect(() => {
    if (token) {
      fetchClasses();
      fetchAttendanceStats();
    }
  }, [token, fetchClasses, fetchAttendanceStats]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    }
  }, [selectedClass, fetchStudentsByClass]);

  const handleAttendanceToggle = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const validateAttendance = () => {
    const errors = [];
    
    if (!selectedClass) {
      errors.push('Please select a class');
    }
    
    if (students.length === 0) {
      errors.push('No students found in selected class');
    }
    
    if (!selectedDate) {
      errors.push('Please select a date');
    }
    
    // Check if date is not in future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const selectedDateObj = new Date(selectedDate);
    
    if (selectedDateObj > today) {
      errors.push('Cannot mark attendance for future dates');
    }
    
    return errors;
  };

  const handleSubmitAttendance = async () => {
    // Validate
    const validationErrors = validateAttendance();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setTimeout(() => setError(''), 5000);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));

      await axios.post('/api/admin/attendance/mark', {
        classId: selectedClass,
        date: selectedDate,
        attendanceRecords
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Attendance marked successfully for ' + students.length + ' students!');
      
      // Reset
      setSelectedClass('');
      setStudents([]);
      setAttendance({});
      
      fetchAttendanceStats();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error.response?.data?.message || 'Failed to mark attendance');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;

  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-pink-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-600 via-rose-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <FaClipboardCheck className="text-white text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Attendance Management
                </h1>
                <p className="text-gray-600 text-sm sm:text-base font-semibold">
                  Mark and track daily attendance
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-xl">
                <FaCalendarAlt className="text-pink-600 text-xl" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none"
                />
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 focus:outline-none font-bold"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
              {selectedClass && students.length > 0 && (
                <button 
                  onClick={handleSubmitAttendance}
                  disabled={submitting}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                  Save Attendance
                </button>
              )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaCheckCircle className="text-3xl" />
                <span className="text-3xl font-black">{selectedClass ? presentCount : stats?.presentToday || 0}</span>
              </div>
              <p className="font-bold opacity-90">Present</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaTimesCircle className="text-3xl" />
                <span className="text-3xl font-black">{selectedClass ? absentCount : stats?.absentToday || 0}</span>
              </div>
              <p className="font-bold opacity-90">Absent</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaUsers className="text-3xl" />
                <span className="text-3xl font-black">{selectedClass ? students.length : stats?.totalStudents || 0}</span>
              </div>
              <p className="font-bold opacity-90">Total Students</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaCheckCircle className="text-3xl" />
                <span className="text-3xl font-black">
                  {selectedClass && students.length > 0 
                    ? ((presentCount / students.length) * 100).toFixed(1) 
                    : stats?.attendanceRate || '0%'}
                </span>
              </div>
              <p className="font-bold opacity-90">Attendance Rate</p>
            </div>
          </div>

          {/* Attendance Marking */}
          {!selectedClass ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border-2 border-pink-100">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaClipboardCheck className="text-5xl text-pink-400" />
              </div>
              <p className="text-xl font-black text-gray-900 mb-2">Attendance System</p>
              <p className="text-gray-500 font-semibold">Select a class to mark today&apos;s attendance</p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaSpinner className="text-5xl text-pink-600 animate-spin mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-600">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Students Found</p>
              <p className="text-gray-600">This class has no students enrolled</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-pink-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  Mark Attendance - {classes.find(c => c._id === selectedClass)?.name}
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const allPresent = {};
                      students.forEach(s => { allPresent[s._id] = 'present'; });
                      setAttendance(allPresent);
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-all"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => {
                      const allAbsent = {};
                      students.forEach(s => { allAbsent[s._id] = 'absent'; });
                      setAttendance(allAbsent);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {students.map((student, index) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-black">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">
                          {student.user?.firstName} {student.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAttendanceToggle(student._id, 'present')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${
                          attendance[student._id] === 'present'
                            ? 'bg-green-500 text-white shadow-lg scale-105'
                            : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                        }`}
                      >
                        <FaCheckCircle className="inline mr-2" />
                        Present
                      </button>
                      <button
                        onClick={() => handleAttendanceToggle(student._id, 'absent')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${
                          attendance[student._id] === 'absent'
                            ? 'bg-red-500 text-white shadow-lg scale-105'
                            : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                        }`}
                      >
                        <FaTimesCircle className="inline mr-2" />
                        Absent
                      </button>
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
