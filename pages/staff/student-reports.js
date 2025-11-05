import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { FaFileAlt, FaSpinner, FaSearch, FaUserGraduate, FaTimes } from 'react-icons/fa';

export default function StudentReports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Get staff's classes first
      const dashboardRes = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get all students
      const studentsRes = await axios.get('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudents(studentsRes.data.students || studentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const name = `${student.user?.firstName} ${student.user?.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-pink-600 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-pink-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaFileAlt className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Student Reports
                </h1>
                <p className="text-gray-600 font-semibold">View and generate student performance reports</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 focus:outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <FaTimes className="text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          </div>

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Students Found</p>
              <p className="text-gray-600">Students will appear here once they are assigned to your classes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map(student => (
                <div key={student._id} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-pink-100 hover:border-pink-300 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                      <FaUserGraduate className="text-pink-600 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">{student.user?.firstName} {student.user?.lastName}</h3>
                      <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Class:</span>
                      <span className="font-bold">{student.class?.name || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Roll No:</span>
                      <span className="font-bold">{student.rollNumber || 'N/A'}</span>
                    </p>
                  </div>
                  <button className="w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-2 rounded-lg font-bold hover:shadow-lg transition-all">
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

