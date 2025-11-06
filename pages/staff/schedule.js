import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { FaClock, FaSpinner, FaChalkboard, FaBook, FaMapMarkerAlt } from 'react-icons/fa';

export default function Schedule() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState(null);

  useEffect(() => {
    if (token) {
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaClock className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Schedule
                </h1>
                <p className="text-gray-600 font-semibold">Your classes and teaching schedule</p>
              </div>
            </div>
          </div>

          {/* Staff Info */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">{scheduleData?.staff.name}</h3>
            <p className="text-sm opacity-90">Employee ID: {scheduleData?.staff.employeeId}</p>
            <p className="text-sm opacity-90">Department: {scheduleData?.staff.department}</p>
          </div>

          {/* Schedule */}
          {scheduleData?.schedule.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaChalkboard className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Classes Assigned</p>
              <p className="text-gray-600">Contact admin to assign classes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scheduleData?.schedule.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100 hover:border-purple-300 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FaChalkboard className="text-purple-600 text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{item.className}</h3>
                      <p className="text-sm text-gray-600">Grade {item.grade} - Section {item.section}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaBook className="text-purple-600" />
                      <span className="font-semibold">Subjects: {item.subjects}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaMapMarkerAlt className="text-purple-600" />
                      <span className="font-semibold">Room: {item.room}</span>
                    </div>
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

