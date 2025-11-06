import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { FaClipboardCheck, FaSpinner, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';

export default function Attendance() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    if (token) {
      fetchAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-blue-600 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaClipboardCheck className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  My Attendance
                </h1>
                <p className="text-gray-600 font-semibold">View your attendance record</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-2xl" />
                <span className="text-3xl font-black">{attendanceData?.stats.presentDays || 0}</span>
              </div>
              <p className="font-bold">Present Days</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaTimesCircle className="text-2xl" />
                <span className="text-3xl font-black">{attendanceData?.stats.absentDays || 0}</span>
              </div>
              <p className="font-bold">Absent Days</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaCalendarAlt className="text-2xl" />
                <span className="text-3xl font-black">{attendanceData?.stats.totalDays || 0}</span>
              </div>
              <p className="font-bold">Total Days</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-2xl" />
                <span className="text-3xl font-black">{attendanceData?.stats.attendanceRate || '0%'}</span>
              </div>
              <p className="font-bold">Attendance Rate</p>
            </div>
          </div>

          {/* Attendance Records */}
          {attendanceData?.attendance.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaClipboardCheck className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Attendance Records</p>
              <p className="text-gray-600">Your attendance will be tracked once classes begin</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <h3 className="text-white font-black text-lg">Attendance History (Last 30 Days)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-100 to-cyan-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-blue-900 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-blue-900 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-blue-900 uppercase">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {attendanceData.attendance.map((record, index) => (
                      <tr key={record._id || index} className="hover:bg-blue-50 transition-all">
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status === 'present' ? (
                              <><FaCheckCircle className="inline mr-1" /> Present</>
                            ) : (
                              <><FaTimesCircle className="inline mr-1" /> Absent</>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'System'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

