import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUserCheck, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaUsers, FaChalkboard
} from 'react-icons/fa';

export default function MarkAttendance() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [myClasses, setMyClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      fetchMyClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const schedule = response.data.data?.todaySchedule || [];
      
      // Get unique classes from schedule
      const uniqueClasses = [];
      const classIds = new Set();
      
      schedule.forEach(item => {
        if (item.className && !classIds.has(item.className)) {
          uniqueClasses.push(item);
          classIds.add(item.className);
        }
      });
      
      setMyClasses(uniqueClasses);
      
      if (uniqueClasses.length === 0) {
        toast('No classes assigned to you', {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load your classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/staff/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allStudents = response.data.students || response.data.data || [];
      
      // Filter by selected class name
      const selectedClassName = myClasses.find(c => c.className === selectedClass)?.className;
      const filtered = allStudents.filter(s => s.class?.name === selectedClassName);
      
      setStudents(filtered);
      
      if (filtered.length === 0) {
        toast('No students found in this class', {
          icon: 'ℹ️',
        });
      }
      
      // Initialize attendance
      const initialAttendance = {};
      filtered.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const handleToggle = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
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

  const handleSubmit = async () => {
    // Validate
    const validationErrors = validateAttendance();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('. '));
      return;
    }

    setSubmitting(true);

    try {
      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));

      // Get class ID from students
      const classId = students[0]?.class?._id;

      if (!classId) {
        toast.error('Unable to determine class ID. Please try again.');
        setSubmitting(false);
        return;
      }

      await axios.post('/api/staff/attendance', {
        classId,
        date: selectedDate,
        attendanceRecords
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Attendance marked successfully for ${students.length} students!`);
      
      // Reset selections
      setSelectedClass('');
      setStudents([]);
      setAttendance({});
    } catch (error) {
      console.error('Error marking attendance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-blue-600 animate-spin" />
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaUserCheck className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Mark Attendance
                </h1>
                <p className="text-gray-600 font-semibold">Mark student attendance for your classes</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                selectedDate ? 'bg-gray-100 border-gray-100' : 'bg-red-50 border-red-300'
              }`}>
                <FaCalendarAlt className="text-blue-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none font-bold transition-all ${
                  selectedClass 
                    ? 'border-gray-200 focus:border-blue-500 focus:ring-blue-200' 
                    : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                }`}
              >
                <option value="">Select Class</option>
                {myClasses.map((cls, idx) => (
                  <option key={idx} value={cls.className}>{cls.className} - {cls.subject}</option>
                ))}
              </select>
              {selectedClass && students.length > 0 && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                  Save Attendance
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-2xl">✅</span>
              <p className="text-green-700 font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-2xl">❌</span>
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

          {/* Stats */}
          {selectedClass && students.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaCheckCircle className="text-2xl" />
                  <span className="text-3xl font-black">{presentCount}</span>
                </div>
                <p className="font-bold">Present</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaTimesCircle className="text-2xl" />
                  <span className="text-3xl font-black">{absentCount}</span>
                </div>
                <p className="font-bold">Absent</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaUsers className="text-2xl" />
                  <span className="text-3xl font-black">{students.length}</span>
                </div>
                <p className="font-bold">Total</p>
              </div>
            </div>
          )}

          {/* Attendance List */}
          {!selectedClass ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaChalkboard className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">Select a Class</p>
              <p className="text-gray-600">Choose a class to mark attendance</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Students Found</p>
              <p className="text-gray-600">This class has no students enrolled</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Mark Attendance - {selectedClass}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allPresent = {};
                      students.forEach(s => { allPresent[s._id] = 'present'; });
                      setAttendance(allPresent);
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200"
                  >
                    All Present
                  </button>
                  <button
                    onClick={() => {
                      const allAbsent = {};
                      students.forEach(s => { allAbsent[s._id] = 'absent'; });
                      setAttendance(allAbsent);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200"
                  >
                    All Absent
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
                      <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black">
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
                        onClick={() => handleToggle(student._id, 'present')}
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
                        onClick={() => handleToggle(student._id, 'absent')}
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

