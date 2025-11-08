import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaChartLine, FaSpinner, FaChalkboard, FaUsers, FaTrophy, 
  FaCalendarCheck, FaExclamationTriangle, FaChartBar, FaArrowUp,
  FaArrowDown, FaStar, FaGraduationCap, FaInfoCircle, FaDownload,
  FaPrint, FaFilter, FaPercentage, FaMedal, FaAward, FaClipboardList,
  FaCheckCircle
} from 'react-icons/fa';

export default function ClassAnalytics() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('performance');

  useEffect(() => {
    if (token) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/staff/class-analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch analytics');
      }
      
      setAnalyticsData(response.data.data);
      
      if (response.data.data?.classes?.length > 0) {
        // Auto-select class with most students or first class
        const classToSelect = response.data.data.classes.reduce((prev, current) => 
          (current.totalStudents > prev.totalStudents) ? current : prev
        );
        setSelectedClass(classToSelect);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load analytics');
      toast.error('Failed to load class analytics. Please try again.', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-500 border-green-600';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-500 border-blue-600';
    if (grade === 'C+' || grade === 'C') return 'bg-yellow-500 border-yellow-600';
    if (grade === 'D' || grade === 'E') return 'bg-orange-500 border-orange-600';
    return 'bg-red-500 border-red-600';
  };

  const getPerformanceStatus = (percentage) => {
    if (percentage >= 75) return { text: 'Excellent', color: 'text-green-600', icon: FaTrophy };
    if (percentage >= 60) return { text: 'Good', color: 'text-blue-600', icon: FaStar };
    if (percentage >= 50) return { text: 'Average', color: 'text-yellow-600', icon: FaCheckCircle };
    return { text: 'Needs Improvement', color: 'text-red-600', icon: FaExclamationTriangle };
  };

  const sortedClasses = useMemo(() => {
    if (!analyticsData?.classes) return [];
    
    return [...analyticsData.classes].sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return parseFloat(b.gradeStats.averagePercentage) - parseFloat(a.gradeStats.averagePercentage);
        case 'attendance':
          return parseFloat(b.attendanceStats.attendanceRate) - parseFloat(a.attendanceStats.attendanceRate);
        case 'students':
          return b.totalStudents - a.totalStudents;
        case 'name':
          return a.className.localeCompare(b.className);
        default:
          return 0;
      }
    });
  }, [analyticsData, sortBy]);

  const overallStats = useMemo(() => {
    if (!analyticsData?.classes || analyticsData.classes.length === 0) {
      return {
        totalStudents: 0,
        avgPerformance: 0,
        avgAttendance: 0,
        totalExams: 0
      };
    }

    const totalStudents = analyticsData.classes.reduce((sum, cls) => sum + cls.totalStudents, 0);
    const avgPerformance = analyticsData.classes.reduce((sum, cls) => sum + parseFloat(cls.gradeStats.averagePercentage || 0), 0) / analyticsData.classes.length;
    const avgAttendance = analyticsData.classes.reduce((sum, cls) => sum + parseFloat(cls.attendanceStats.attendanceRate || 0), 0) / analyticsData.classes.length;
    const totalExams = analyticsData.classes.reduce((sum, cls) => sum + cls.gradeStats.totalExams, 0);

    return {
      totalStudents,
      avgPerformance: avgPerformance.toFixed(2),
      avgAttendance: avgAttendance.toFixed(2),
      totalExams
    };
  }, [analyticsData]);

  const handlePrint = () => {
    window.print();
    toast.success('Preparing print preview...');
  };

  const handleExport = useCallback(() => {
    if (!selectedClass) return;
    
    try {
      let csvContent = `Class Analytics Report\n\n`;
      csvContent += `Class:,${selectedClass.className}\n`;
      csvContent += `Grade:,${selectedClass.grade} ${selectedClass.section}\n`;
      csvContent += `Total Students:,${selectedClass.totalStudents}\n`;
      csvContent += `Room:,${selectedClass.room}\n\n`;
      
      csvContent += `Performance Summary\n`;
      csvContent += `Average Score:,${selectedClass.gradeStats.averagePercentage}%\n`;
      csvContent += `Highest Score:,${selectedClass.gradeStats.highestScore}%\n`;
      csvContent += `Lowest Score:,${selectedClass.gradeStats.lowestScore}%\n`;
      csvContent += `Pass Rate:,${selectedClass.gradeStats.passRate}%\n`;
      csvContent += `Total Exams:,${selectedClass.gradeStats.totalExams}\n\n`;
      
      csvContent += `Attendance Summary\n`;
      csvContent += `Attendance Rate:,${selectedClass.attendanceStats.attendanceRate}%\n`;
      csvContent += `Total Records:,${selectedClass.attendanceStats.totalRecords}\n`;
      csvContent += `Present:,${selectedClass.attendanceStats.present}\n`;
      csvContent += `Absent:,${selectedClass.attendanceStats.absent}\n`;
      csvContent += `Late:,${selectedClass.attendanceStats.late}\n\n`;
      
      if (selectedClass.topPerformers.length > 0) {
        csvContent += `Top Performers\n`;
        csvContent += `Rank,Name,Roll Number,Average\n`;
        selectedClass.topPerformers.forEach((student, index) => {
          csvContent += `${index + 1},${student.name},${student.rollNumber},${student.average}%\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${selectedClass.className}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    }
  }, [selectedClass]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading class analytics...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
              <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Analytics</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchData}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Try Again
              </button>
            </div>
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl">
                  <FaChartLine className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-black">Class Analytics</h1>
                  <p className="text-indigo-100 font-semibold">
                    Performance analytics for {analyticsData?.totalClasses || 0} classes • {analyticsData?.staffName}
                  </p>
                </div>
              </div>
              {selectedClass && (
                <div className="flex gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    <FaPrint />
                    Print
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    <FaDownload />
                    Export
                  </button>
                </div>
              )}
            </div>
          </div>

          {!analyticsData || sortedClasses.length === 0 ? (
            <div>
              {/* Important Information */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">About Class Analytics</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• View comprehensive performance analytics for your assigned classes</li>
                      <li>• Track student performance, attendance, and grade distribution</li>
                      <li>• Identify top performers and students who need additional support</li>
                      <li>• Compare class performance across multiple metrics</li>
                      <li>• Export data for reporting and record-keeping</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
                <FaChalkboard className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Classes Assigned</h3>
                <p className="text-gray-600">Analytics will appear once classes are assigned to you</p>
              </div>
            </div>
          ) : (
            <>
              {/* Important Information */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Analytics Information</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Data shown is for the current academic year only</li>
                      <li>• Attendance statistics are based on the last 30 days</li>
                      <li>• Top performers are ranked by average score across all exams</li>
                      <li>• Students scoring below 50% are flagged as needing attention</li>
                      <li>• Grade distribution shows the frequency of each grade achieved</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Overall Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FaUsers className="text-3xl" />
                    <span className="text-4xl font-black">{overallStats.totalStudents}</span>
                  </div>
                  <p className="font-bold text-lg">Total Students</p>
                  <p className="text-blue-100 text-sm">Across all classes</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FaChartLine className="text-3xl" />
                    <span className="text-4xl font-black">{overallStats.avgPerformance}%</span>
                  </div>
                  <p className="font-bold text-lg">Avg Performance</p>
                  <p className="text-green-100 text-sm">All classes combined</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FaCalendarCheck className="text-3xl" />
                    <span className="text-4xl font-black">{overallStats.avgAttendance}%</span>
                  </div>
                  <p className="font-bold text-lg">Avg Attendance</p>
                  <p className="text-purple-100 text-sm">Last 30 days</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FaClipboardList className="text-3xl" />
                    <span className="text-4xl font-black">{overallStats.totalExams}</span>
                  </div>
                  <p className="font-bold text-lg">Total Exams</p>
                  <p className="text-yellow-100 text-sm">Conducted</p>
                </div>
              </div>

              {/* Class Selector with Sort */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <FaFilter className="text-indigo-600" />
                    Select Class to Analyze ({sortedClasses.length} classes)
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none font-semibold"
                  >
                    <option value="performance">Sort by Performance</option>
                    <option value="attendance">Sort by Attendance</option>
                    <option value="students">Sort by Student Count</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sortedClasses.map((cls) => {
                    const perfStatus = getPerformanceStatus(parseFloat(cls.gradeStats.averagePercentage));
                    const StatusIcon = perfStatus.icon;
                    
                    return (
                      <button
                        key={cls.classId}
                        onClick={() => setSelectedClass(cls)}
                        className={`p-5 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                          selectedClass?.classId === cls.classId
                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-indigo-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-black text-gray-900 text-lg">{cls.className}</div>
                          <StatusIcon className={`text-xl ${perfStatus.color}`} />
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Grade {cls.grade} {cls.section} • Room {cls.room}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Students:</span>
                            <span className="font-bold text-indigo-600">{cls.totalStudents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Avg Score:</span>
                            <span className={`font-bold ${perfStatus.color}`}>{cls.gradeStats.averagePercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Attendance:</span>
                            <span className="font-bold text-green-600">{cls.attendanceStats.attendanceRate}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedClass && (
                <>
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <FaUsers className="text-3xl text-blue-600" />
                        <span className="text-4xl font-black text-blue-600">{selectedClass.totalStudents}</span>
                      </div>
                      <p className="text-sm text-gray-600 font-bold">Total Students</p>
                      <p className="text-xs text-gray-500 mt-1">Enrolled in class</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <FaChartLine className="text-3xl text-green-600" />
                        <span className="text-4xl font-black text-green-600">{selectedClass.gradeStats.averagePercentage}%</span>
                      </div>
                      <p className="text-sm text-gray-600 font-bold">Avg Performance</p>
                      <p className="text-xs text-gray-500 mt-1">Based on {selectedClass.gradeStats.totalExams} exams</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <FaCalendarCheck className="text-3xl text-purple-600" />
                        <span className="text-4xl font-black text-purple-600">{selectedClass.attendanceStats.attendanceRate}%</span>
                      </div>
                      <p className="text-sm text-gray-600 font-bold">Attendance Rate</p>
                      <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <FaTrophy className="text-3xl text-yellow-600" />
                        <span className="text-4xl font-black text-yellow-600">{selectedClass.gradeStats.passRate}%</span>
                      </div>
                      <p className="text-sm text-gray-600 font-bold">Pass Rate</p>
                      <p className="text-xs text-gray-500 mt-1">Students passing exams</p>
                    </div>
                  </div>

                  {/* Score Range */}
                  {selectedClass.gradeStats.totalExams > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                        <FaPercentage className="text-indigo-600" />
                        Score Range & Distribution
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 text-center">
                          <FaArrowUp className="text-3xl text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">Highest Score</p>
                          <p className="text-4xl font-black text-green-600">{selectedClass.gradeStats.highestScore}%</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 text-center">
                          <FaPercentage className="text-3xl text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">Average Score</p>
                          <p className="text-4xl font-black text-blue-600">{selectedClass.gradeStats.averagePercentage}%</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border-2 border-red-200 text-center">
                          <FaArrowDown className="text-3xl text-red-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">Lowest Score</p>
                          <p className="text-4xl font-black text-red-600">{selectedClass.gradeStats.lowestScore}%</p>
                        </div>
                      </div>

                      {/* Grade Distribution */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Grade Distribution</h3>
                      <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
                        {Object.entries(selectedClass.gradeStats.gradeDistribution).map(([grade, count]) => (
                          <div key={grade} className="text-center">
                            <div className={`${getGradeColor(grade)} text-white rounded-xl p-4 mb-2 shadow-lg border-2`}>
                              <p className="text-2xl font-black">{count}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-700">{grade}</p>
                          </div>
                        ))}
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
                        {Object.entries(selectedClass.gradeStats.subjectPerformance).map(([subject, perf]) => {
                          const perfStatus = getPerformanceStatus(parseFloat(perf.average));
                          const StatusIcon = perfStatus.icon;
                          
                          return (
                            <div key={subject} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200 hover:shadow-lg transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-black text-gray-900 text-lg">{subject}</h3>
                                <StatusIcon className={`text-xl ${perfStatus.color}`} />
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Average Score:</span>
                                  <span className={`font-black text-xl ${perfStatus.color}`}>{perf.average}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Total Exams:</span>
                                  <span className="font-bold text-gray-900">{perf.count}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-purple-200">
                                  <span className={`px-3 py-1 ${perfStatus.color} bg-white rounded-full text-xs font-bold border-2`}>
                                    {perfStatus.text}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Top Performers & Needs Attention */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    {selectedClass.topPerformers.length > 0 ? (
                      <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                          <FaMedal className="text-yellow-500" />
                          Top Performers (Top 5)
                        </h2>
                        <div className="space-y-3">
                          {selectedClass.topPerformers.map((student, index) => (
                            <div key={student.studentId} className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-300 hover:shadow-lg transition-all">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 ${
                                  index === 0 ? 'bg-yellow-500' : 
                                  index === 1 ? 'bg-gray-400' : 
                                  index === 2 ? 'bg-orange-600' : 
                                  'bg-yellow-400'
                                } text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg`}>
                                  #{index + 1}
                                </div>
                                <div>
                                  <p className="font-black text-gray-900">{student.name}</p>
                                  <p className="text-xs text-gray-600">Roll: {student.rollNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-black text-green-600">{student.average}%</p>
                                <FaAward className="text-yellow-500 text-xl ml-auto mt-1" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-xl font-bold text-gray-900 mb-2">No Performance Data</p>
                        <p className="text-gray-600">Top performers will appear after exams are graded</p>
                      </div>
                    )}

                    {/* Needs Attention */}
                    {selectedClass.needsAttention.length > 0 ? (
                      <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                          <FaExclamationTriangle className="text-red-500" />
                          Needs Attention ({selectedClass.needsAttention.length} students)
                        </h2>
                        <div className="space-y-3">
                          {selectedClass.needsAttention.map((student) => (
                            <div key={student.studentId} className="flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-300 hover:shadow-lg transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                  <FaExclamationTriangle className="text-xl" />
                                </div>
                                <div>
                                  <p className="font-black text-gray-900">{student.name}</p>
                                  <p className="text-xs text-gray-600">Roll: {student.rollNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-black text-red-600">{student.average}%</p>
                                <p className="text-xs text-red-600 font-bold mt-1">&lt; 50% Avg</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <FaTrophy className="text-6xl text-green-300 mx-auto mb-4" />
                        <p className="text-xl font-bold text-gray-900 mb-2">All Students Performing Well</p>
                        <p className="text-gray-600">No students are currently scoring below 50%</p>
                      </div>
                    )}
                  </div>

                  {/* Attendance Summary */}
                  {selectedClass.attendanceStats.totalRecords > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <FaCalendarCheck className="text-green-600" />
                        Attendance Summary (Last 30 Days)
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                          <p className="text-4xl font-black text-gray-900">{selectedClass.attendanceStats.totalRecords}</p>
                          <p className="text-sm text-gray-600 mt-2 font-bold">Total Records</p>
                        </div>
                        <div className="text-center bg-green-50 rounded-xl p-5 border-2 border-green-200">
                          <p className="text-4xl font-black text-green-600">{selectedClass.attendanceStats.present}</p>
                          <p className="text-sm text-gray-600 mt-2 font-bold">Present</p>
                        </div>
                        <div className="text-center bg-red-50 rounded-xl p-5 border-2 border-red-200">
                          <p className="text-4xl font-black text-red-600">{selectedClass.attendanceStats.absent}</p>
                          <p className="text-sm text-gray-600 mt-2 font-bold">Absent</p>
                        </div>
                        <div className="text-center bg-yellow-50 rounded-xl p-5 border-2 border-yellow-200">
                          <p className="text-4xl font-black text-yellow-600">{selectedClass.attendanceStats.late}</p>
                          <p className="text-sm text-gray-600 mt-2 font-bold">Late</p>
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
