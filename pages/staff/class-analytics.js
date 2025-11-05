import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { FaChartLine, FaSpinner, FaChalkboard, FaUsers } from 'react-icons/fa';

export default function ClassAnalytics() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-indigo-600 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaChartLine className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Class Analytics
                </h1>
                <p className="text-gray-600 font-semibold">Performance analytics for your classes</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
              <FaChalkboard className="text-3xl mb-2" />
              <p className="text-3xl font-black">{dashboardData?.stats.totalClasses || 0}</p>
              <p className="font-bold opacity-90">My Classes</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
              <FaUsers className="text-3xl mb-2" />
              <p className="text-3xl font-black">{dashboardData?.stats.totalStudents || 0}</p>
              <p className="font-bold opacity-90">Total Students</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <FaChartLine className="text-3xl mb-2" />
              <p className="text-3xl font-black">{dashboardData?.stats.attendanceRate || '0%'}</p>
              <p className="font-bold opacity-90">Avg Attendance</p>
            </div>
          </div>

          {/* Class List */}
          {dashboardData?.todaySchedule.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaChalkboard className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Classes Assigned</p>
              <p className="text-gray-600">Analytics will appear once classes are assigned</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardData?.todaySchedule.map((cls, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <FaChalkboard className="text-indigo-600 text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{cls.className}</h3>
                      <p className="text-sm text-gray-600">{cls.subject}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Grade:</span>
                      <span className="font-bold">{cls.grade}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Section:</span>
                      <span className="font-bold">{cls.section}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

