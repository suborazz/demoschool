import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { FaTrophy, FaSpinner, FaBook, FaStar, FaMedal } from 'react-icons/fa';

export default function Grades() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gradesData, setGradesData] = useState(null);

  useEffect(() => {
    if (token) {
      fetchGrades();
    }
  }, [token]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student/grades', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGradesData(response.data.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-purple-600 animate-spin" />
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaTrophy className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Grades
                </h1>
                <p className="text-gray-600 font-semibold">View your academic performance</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <FaStar className="text-3xl mb-2" />
              <p className="text-3xl font-black">{gradesData?.stats.avgPercentage || '0%'}</p>
              <p className="font-bold opacity-90">Average Score</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
              <FaBook className="text-3xl mb-2" />
              <p className="text-3xl font-black">{gradesData?.stats.totalGrades || 0}</p>
              <p className="font-bold opacity-90">Total Grades</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
              <FaMedal className="text-3xl mb-2" />
              <p className="text-3xl font-black">{Object.keys(gradesData?.stats.gradesBySubject || {}).length}</p>
              <p className="font-bold opacity-90">Subjects</p>
            </div>
          </div>

          {/* Grades List */}
          {gradesData?.grades.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Grades Yet</p>
              <p className="text-gray-600">Your grades will appear here once teachers add them</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <h3 className="text-white font-black text-lg">All Grades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase">Exam Type</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase">Marks</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase">Percentage</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase">Grade</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {gradesData.grades.map((grade, index) => (
                      <tr key={grade._id || index} className="hover:bg-purple-50 transition-all">
                        <td className="px-6 py-4 font-bold text-gray-900">{grade.subject?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{grade.examType}</td>
                        <td className="px-6 py-4 font-bold">{grade.marksObtained}/{grade.maxMarks}</td>
                        <td className="px-6 py-4 font-bold text-purple-600">{grade.percentage}%</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg font-bold ${
                            grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-700' :
                            grade.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            grade.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(grade.createdAt).toLocaleDateString()}
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

