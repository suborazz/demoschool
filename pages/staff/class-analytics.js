import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { 
  FaChartLine, FaSpinner, FaChalkboard, FaUsers, FaTrophy, 
  FaCalendarCheck, FaExclamationTriangle, FaChartBar, FaArrowUp,
  FaArrowDown, FaStar, FaGraduationCap
} from 'react-icons/fa';

export default function ClassAnalytics() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    if (token) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/class-analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData(response.data.data);
      if (response.data.data?.classes?.length > 0) {
        setSelectedClass(response.data.data.classes[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-500';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-500';
    if (grade === 'C+' || grade === 'C') return 'bg-yellow-500';
    return 'bg-red-500';
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
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaChartLine className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Class Analytics
                </h1>
                <p className="text-gray-600 font-semibold">
                  Performance analytics for {analyticsData?.totalClasses || 0} classes
                </p>
              </div>
            </div>
          </div>

          {!analyticsData || analyticsData.classes?.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaChalkboard className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Classes Assigned</p>
              <p className="text-gray-600">Analytics will appear once classes are assigned</p>
            </div>
          ) : (
            <>
              {/* Class Selector */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Select Class to Analyze
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {analyticsData.classes.map((cls) => (
                    <button
                      key={cls.classId}
                      onClick={() => setSelectedClass(cls)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedClass?.classId === cls.classId
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-black text-gray-900">{cls.className}</div>
                      <div className="text-sm text-gray-600">
                        Grade {cls.grade} {cls.section}
                      </div>
                      <div className="text-xs text-indigo-600 font-bold mt-1">
                        {cls.totalStudents} Students
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedClass && (
                <>
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                      <FaUsers className="text-3xl text-blue-600 mb-2" />
                      <p className="text-3xl font-black text-blue-600">{selectedClass.totalStudents}</p>
                      <p className="text-sm text-gray-600 font-semibold">Total Students</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                      <FaChartLine className="text-3xl text-green-600 mb-2" />
                      <p className="text-3xl font-black text-green-600">{selectedClass.gradeStats.averagePercentage}%</p>
                      <p className="text-sm text-gray-600 font-semibold">Avg Performance</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                      <FaCalendarCheck className="text-3xl text-purple-600 mb-2" />
                      <p className="text-3xl font-black text-purple-600">{selectedClass.attendanceStats.attendanceRate}%</p>
                      <p className="text-sm text-gray-600 font-semibold">Attendance Rate</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                      <FaTrophy className="text-3xl text-yellow-600 mb-2" />
                      <p className="text-3xl font-black text-yellow-600">{selectedClass.gradeStats.passRate}%</p>
                      <p className="text-sm text-gray-600 font-semibold">Pass Rate</p>
                    </div>
                  </div>

                  {/* Grade Distribution */}
                  {selectedClass.gradeStats.totalExams > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                        <FaChartBar className="text-indigo-600" />
                        Grade Distribution
                      </h2>
                      <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
                        {Object.entries(selectedClass.gradeStats.gradeDistribution).map(([grade, count]) => (
                          <div key={grade} className="text-center">
                            <div className={`${getGradeColor(grade)} text-white rounded-xl p-4 mb-2`}>
                              <p className="text-2xl font-black">{count}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-700">{grade}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <p className="text-gray-600">Highest Score</p>
                          <p className="text-2xl font-black text-green-600">{selectedClass.gradeStats.highestScore}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Average Score</p>
                          <p className="text-2xl font-black text-blue-600">{selectedClass.gradeStats.averagePercentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Lowest Score</p>
                          <p className="text-2xl font-black text-red-600">{selectedClass.gradeStats.lowestScore}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subject Performance */}
                  {Object.keys(selectedClass.gradeStats.subjectPerformance).length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                        <FaGraduationCap className="text-purple-600" />
                        Subject-wise Performance
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(selectedClass.gradeStats.subjectPerformance).map(([subject, perf]) => (
                          <div key={subject} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                            <h3 className="font-black text-gray-900 mb-2">{subject}</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Average:</span>
                                <span className="font-black text-indigo-600">{perf.average}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Exams:</span>
                                <span className="font-bold">{perf.count}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Performers & Needs Attention */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    {selectedClass.topPerformers.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                          <FaStar className="text-yellow-500" />
                          Top Performers
                        </h2>
                        <div className="space-y-3">
                          {selectedClass.topPerformers.map((student, index) => (
                            <div key={student.studentId} className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-black">
                                  #{index + 1}
                                </div>
                                <div>
                                  <p className="font-black text-gray-900">{student.name}</p>
                                  <p className="text-xs text-gray-600">Roll: {student.rollNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-green-600">{student.average}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Needs Attention */}
                    {selectedClass.needsAttention.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                          <FaExclamationTriangle className="text-red-500" />
                          Needs Attention
                        </h2>
                        <div className="space-y-3">
                          {selectedClass.needsAttention.map((student) => (
                            <div key={student.studentId} className="flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center">
                                  <FaExclamationTriangle />
                                </div>
                                <div>
                                  <p className="font-black text-gray-900">{student.name}</p>
                                  <p className="text-xs text-gray-600">Roll: {student.rollNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-red-600">{student.average}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendance Summary */}
                  {selectedClass.attendanceStats.totalRecords > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                        <FaCalendarCheck className="text-green-600" />
                        Attendance Summary (Last 30 Days)
                      </h2>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-3xl font-black text-gray-900">{selectedClass.attendanceStats.totalRecords}</p>
                          <p className="text-sm text-gray-600">Total Records</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-black text-green-600">{selectedClass.attendanceStats.present}</p>
                          <p className="text-sm text-gray-600">Present</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-black text-red-600">{selectedClass.attendanceStats.absent}</p>
                          <p className="text-sm text-gray-600">Absent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-black text-yellow-600">{selectedClass.attendanceStats.late}</p>
                          <p className="text-sm text-gray-600">Late</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

