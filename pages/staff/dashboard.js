import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FaClipboardCheck, FaChalkboard, FaBook, FaCalendar,
  FaUserCheck, FaChartLine, FaUpload, FaClock, FaBell,
  FaTrophy, FaUsers, FaStar, FaCheckCircle, FaEdit,
  FaFileAlt, FaGraduationCap, FaClipboardList, FaArrowRight,
  FaExclamationCircle, FaComments, FaAward, FaSpinner
} from 'react-icons/fa';

export default function StaffDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [currentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      title: 'My Classes', 
      value: dashboardData?.stats.totalClasses || 0, 
      icon: FaChalkboard, 
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      bgPattern: 'from-blue-50 to-cyan-50',
      subtitle: 'Active classes',
      trend: dashboardData?.stats.totalClasses > 0 ? 'Teaching' : 'No classes assigned'
    },
    { 
      title: 'Total Students', 
      value: dashboardData?.stats.totalStudents || 0, 
      icon: FaUsers, 
      gradient: 'from-green-500 via-green-600 to-emerald-500',
      bgPattern: 'from-green-50 to-emerald-50',
      subtitle: 'Under your guidance',
      trend: 'Across all classes'
    },
    { 
      title: 'Pending Grades', 
      value: dashboardData?.stats.pendingGrades || 0, 
      icon: FaBook, 
      gradient: 'from-purple-500 via-purple-600 to-pink-500',
      bgPattern: 'from-purple-50 to-pink-50',
      subtitle: 'To review',
      trend: dashboardData?.stats.pendingGrades > 0 ? 'Action needed' : 'All done'
    },
    { 
      title: 'Attendance', 
      value: dashboardData?.stats.attendanceRate || '0%', 
      icon: FaClipboardCheck, 
      gradient: 'from-orange-500 via-orange-600 to-red-500',
      bgPattern: 'from-orange-50 to-red-50',
      subtitle: 'This month',
      trend: parseInt(dashboardData?.stats.attendanceRate) >= 90 ? 'Excellent' : 'Good'
    },
  ];

  const quickActions = [
    { name: 'Mark Attendance', icon: FaUserCheck, gradient: 'from-blue-500 to-cyan-500', badge: null, route: '/staff/mark-attendance' },
    { name: 'Add Grades', icon: FaChartLine, gradient: 'from-green-500 to-emerald-500', badge: dashboardData?.stats.pendingGrades > 0 ? `${dashboardData.stats.pendingGrades} pending` : null, route: '/staff/add-grades' },
    { name: 'Upload Content', icon: FaUpload, gradient: 'from-purple-500 to-pink-500', badge: null, route: '/staff/upload-content' },
    { name: 'View Schedule', icon: FaClock, gradient: 'from-orange-500 to-red-500', badge: null, route: '/staff/schedule' },
    { name: 'Student Reports', icon: FaFileAlt, gradient: 'from-pink-500 to-rose-500', badge: null, route: '/staff/student-reports' },
    { name: 'Class Analytics', icon: FaChartLine, gradient: 'from-indigo-500 to-purple-500', badge: null, route: '/staff/class-analytics' },
  ];

  // Today's schedule from database
  const todaysSchedule = dashboardData?.todaySchedule || [];

  // Hide demo sections
  const pendingTasks = [];
  const classPerformance = [];
  const topStudents = [];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section - Enhanced */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between animate-fadeInUp gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient mb-2 sm:mb-3">Staff Dashboard</h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-semibold">
                Welcome back, {dashboardData?.staff.name}! Ready to inspire young minds today?
              </p>
            </div>
            <div className="flex gap-3 sm:gap-4 mt-0">
              <div className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg text-sm sm:text-base">
                <FaClock className="inline mr-1 sm:mr-2" />
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Staff Info Card */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Employee ID</p>
                <p className="text-2xl font-black">{dashboardData?.staff.employeeId}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Department</p>
                <p className="text-xl font-bold">{dashboardData?.staff.department}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Designation</p>
                <p className="text-xl font-bold">{dashboardData?.staff.designation}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid - Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-4 overflow-hidden tilt-effect"
              >
                {/* Background Pattern */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgPattern} opacity-50`}></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent shimmer"></div>
                </div>

                <div className="relative">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                    <stat.icon className="text-white text-2xl sm:text-3xl" />
                  </div>
                  <h3 className="text-gray-600 text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide">{stat.title}</h3>
                  <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-semibold">{stat.subtitle}</p>
                  <p className="text-xs text-purple-600 font-bold mt-1">{stat.trend}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - 2 cols */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500 animate-fadeInUp">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Quick Actions</h2>
                  <span className="text-xs sm:text-sm text-gray-500 font-semibold">Most used features</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(action.route)}
                      className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
                    >
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      <div className="relative text-center">
                        <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                          <action.icon className="text-white text-2xl" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 group-hover:text-white transition-colors">{action.name}</span>
                        {action.badge && (
                          <span className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                            {action.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Today's Schedule - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
                  <div className="flex items-center">
                    <FaCalendar className="text-3xl sm:text-4xl text-purple-600 mr-2 sm:mr-3 animate-bounce-slow flex-shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Today&apos;s Classes</h2>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold truncate">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {todaysSchedule.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-900 mb-2">No Classes Today</p>
                    <p className="text-gray-600">Enjoy your day or check your full schedule</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {todaysSchedule.map((item, index) => (
                      <div
                        key={index}
                        className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-102 gap-3 sm:gap-0 bg-gradient-to-r from-gray-50 to-purple-50 hover:shadow-lg"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 md:mr-5 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                            <FaBook className="text-purple-600 text-xl sm:text-2xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                              <h3 className="text-base sm:text-lg md:text-xl font-black text-gray-900 truncate">
                                {item.subject}
                              </h3>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-600 truncate">
                              {item.className}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              {/* Quick Stats - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">Today&apos;s Summary</h2>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: 'Classes Today', value: dashboardData?.summary.classesToday || 0, icon: FaChalkboard, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Attendance Marked', value: `${dashboardData?.summary.attendanceMarked || 0}/${dashboardData?.summary.classesToday || 0}`, icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Grades Pending', value: dashboardData?.summary.gradesPending || 0, icon: FaEdit, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Messages', value: dashboardData?.summary.messages || 0, icon: FaComments, color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 sm:p-4 md:p-5 ${item.bg} rounded-xl hover:shadow-lg transition-all hover:scale-105`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <item.icon className={`${item.color} text-xl sm:text-2xl mr-2 sm:mr-3 flex-shrink-0`} />
                        <span className="font-bold text-gray-900 text-sm sm:text-base truncate">{item.label}</span>
                      </div>
                      <span className={`text-2xl sm:text-3xl font-black ${item.color} flex-shrink-0 ml-2`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <FaGraduationCap className="text-4xl mr-3" />
                  <div>
                    <h3 className="text-xl font-black">Your Role</h3>
                    <p className="text-sm opacity-90">{dashboardData?.staff.designation}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="opacity-90">Department:</span>
                    <span className="font-bold">{dashboardData?.staff.department}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="opacity-90">Classes Assigned:</span>
                    <span className="font-bold">{dashboardData?.stats.totalClasses}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="opacity-90">Total Students:</span>
                    <span className="font-bold">{dashboardData?.stats.totalStudents}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Banner - Enhanced */}
          {dashboardData?.stats.totalStudents > 0 && (
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 text-white hover:shadow-green-500/40 transition-all duration-500 animate-fadeInUp relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full filter blur-3xl top-0 left-0 animate-blob"></div>
                <div className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full filter blur-3xl bottom-0 right-0 animate-blob animation-delay-2000"></div>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <div className="flex items-center mb-3 sm:mb-4">
                    <FaAward className="text-4xl sm:text-5xl md:text-6xl mr-3 sm:mr-4 animate-bounce-slow flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black neon-text mb-1 sm:mb-2">Your Impact</h3>
                      <p className="text-sm sm:text-base md:text-lg opacity-90 font-semibold">Making a difference every day</p>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl opacity-90 leading-relaxed">
                    You&apos;re helping <strong className="text-yellow-300 font-black text-lg sm:text-xl md:text-2xl">{dashboardData?.stats.totalStudents} students</strong> achieve their dreams!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: 'Students Taught', value: dashboardData?.stats.totalStudents || 0, icon: '👨‍🎓' },
                    { label: 'Classes', value: dashboardData?.stats.totalClasses || 0, icon: '📚' },
                    { label: 'Attendance', value: dashboardData?.stats.attendanceRate || '0%', icon: '✅' },
                    { label: 'Performance', value: parseInt(dashboardData?.stats.attendanceRate) >= 90 ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐', icon: '' },
                  ].map((metric, i) => (
                    <div
                      key={i}
                      className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center hover:bg-white/30 transition-all"
                    >
                      <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{metric.icon}</div>
                      <p className="text-2xl sm:text-2xl md:text-3xl font-black mb-1">{metric.value}</p>
                      <p className="text-xs opacity-90 font-semibold">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
