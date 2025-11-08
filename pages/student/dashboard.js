import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import UpcomingEvents from '../../components/UpcomingEvents';
import { 
  FaClipboardCheck, FaTrophy, FaBook, FaCalendar,
  FaChartLine, FaStar, FaAward, FaClock, FaCheckCircle,
  FaDownload, FaPlay, FaFileAlt, FaGraduationCap,
  FaBell, FaExclamationCircle, FaArrowRight, FaMedal,
  FaChalkboard, FaBookOpen, FaPencilAlt, FaSpinner
} from 'react-icons/fa';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student/dashboard', {
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
      title: 'Attendance', 
      value: dashboardData?.stats.attendanceRate || '0%', 
      icon: FaClipboardCheck, 
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      bgPattern: 'from-blue-50 to-cyan-50',
      subtitle: parseFloat(dashboardData?.stats.attendanceRate) >= 90 ? 'Excellent record' : 'Good record',
      progress: parseFloat(dashboardData?.stats.attendanceRate) || 0
    },
    { 
      title: 'Overall Grade', 
      value: dashboardData?.stats.overallGrade || 'N/A', 
      icon: FaTrophy, 
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      bgPattern: 'from-yellow-50 to-orange-50',
      subtitle: dashboardData?.stats.avgPercentage || '0%',
      progress: parseFloat(dashboardData?.stats.avgPercentage) || 0
    },
    { 
      title: 'Assignments', 
      value: `${dashboardData?.stats.completedAssignments || 0}/${dashboardData?.stats.totalAssignments || 0}`, 
      icon: FaBook, 
      gradient: 'from-green-500 via-green-600 to-emerald-500',
      bgPattern: 'from-green-50 to-emerald-50',
      subtitle: 'Completed',
      progress: dashboardData?.stats.totalAssignments > 0 
        ? ((dashboardData.stats.completedAssignments / dashboardData.stats.totalAssignments) * 100) 
        : 0
    },
    { 
      title: 'LMS Resources', 
      value: dashboardData?.lmsResources || 0, 
      icon: FaCalendar, 
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      bgPattern: 'from-purple-50 to-pink-50',
      subtitle: 'Available',
      progress: 50
    },
  ];

  const quickActions = [
    { name: 'View Attendance', icon: FaClipboardCheck, gradient: 'from-blue-500 to-cyan-500', route: '/student/attendance' },
    { name: 'Check Grades', icon: FaTrophy, gradient: 'from-purple-500 to-pink-500', route: '/student/grades' },
    { name: 'Access LMS', icon: FaBookOpen, gradient: 'from-green-500 to-emerald-500', route: '/student/lms' },
    { name: 'View Timetable', icon: FaClock, gradient: 'from-orange-500 to-red-500', route: '/student/timetable' },
    { name: 'Download Materials', icon: FaDownload, gradient: 'from-pink-500 to-rose-500', route: '/student/materials' },
    { name: 'View Fees', icon: FaPencilAlt, gradient: 'from-indigo-500 to-purple-500', route: '/student/fees' },
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
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
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section - Enhanced */}
          <div className="animate-fadeInUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient mb-2 sm:mb-3">Student Dashboard</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-semibold">
              Welcome back, {dashboardData?.student.name}! Track your progress and achieve excellence!
            </p>
          </div>

          {/* Student Info Card */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Admission No.</p>
                <p className="text-xl font-black">{dashboardData?.student.admissionNumber}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Roll Number</p>
                <p className="text-xl font-black">{dashboardData?.student.rollNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Class</p>
                <p className="text-xl font-black">{dashboardData?.student.class}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Section</p>
                <p className="text-xl font-black">{dashboardData?.student.section}</p>
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
                  <p className="text-xs text-gray-500 font-semibold mb-3 sm:mb-4">{stat.subtitle}</p>
                  
                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000`} style={{ width: `${stat.progress}%` }}></div>
                  </div>
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
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 sm:mb-8">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(action.route)}
                      className="group relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      <div className="relative text-center">
                        <div className={`w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-gradient-to-br ${action.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                          <action.icon className="text-white text-xl sm:text-2xl" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-white transition-colors">{action.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Grades - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
                  <div className="flex items-center">
                    <FaTrophy className="text-3xl sm:text-4xl text-yellow-500 mr-2 sm:mr-3 animate-bounce-slow flex-shrink-0" />
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Recent Grades</h2>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold">Your latest performance</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/student/grades')}
                    className="px-3 sm:px-4 py-2 bg-purple-100 text-purple-600 rounded-lg font-bold hover:bg-purple-200 transition-all text-xs sm:text-sm self-start sm:self-auto"
                  >
                    View All
                  </button>
                </div>

                {dashboardData?.recentGrades.length === 0 ? (
                  <div className="text-center py-12">
                    <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-900 mb-2">No Grades Yet</p>
                    <p className="text-gray-600">Your grades will appear here once teachers add them</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4">
                      {dashboardData?.recentGrades.map((item, index) => {
                        const gradientColors = [
                          'from-green-500 to-emerald-500',
                          'from-blue-500 to-cyan-500',
                          'from-purple-500 to-pink-500',
                          'from-yellow-500 to-orange-500',
                          'from-indigo-500 to-purple-500'
                        ];
                        const gradient = gradientColors[index % gradientColors.length];
                        
                        return (
                          <div
                            key={index}
                            className="group p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3 sm:gap-0">
                              <div className="flex items-center flex-1 min-w-0">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                                  <FaBook className="text-white text-lg sm:text-xl" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-black text-gray-900 text-base sm:text-lg block truncate">{item.subject}</span>
                                  <span className="text-xs sm:text-sm text-gray-600 font-semibold">{item.marks} • {item.examType}</span>
                                </div>
                              </div>
                              <div className="text-left sm:text-right ml-auto sm:ml-0">
                                <span className={`inline-block px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r ${gradient} text-white rounded-full text-base sm:text-lg font-black shadow-lg`}>
                                  {item.grade}
                                </span>
                              </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${gradient} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Average Grade Display */}
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl text-white text-center">
                      <p className="text-xs sm:text-sm opacity-90 mb-2">Your Average</p>
                      <p className="text-4xl sm:text-5xl font-black neon-text">{dashboardData?.stats.avgPercentage || '0%'}</p>
                      <div className="flex items-center justify-center mt-2 sm:mt-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`text-xl sm:text-2xl mx-0.5 sm:mx-1 ${
                              i < Math.floor(parseFloat(dashboardData?.stats.avgPercentage) / 20) 
                                ? 'text-yellow-300' 
                                : 'text-white/30'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Fee Alert - if pending */}
              {dashboardData?.fees.hasPending && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 text-white">
                  <div className="flex items-center gap-4">
                    <FaExclamationCircle className="text-4xl flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-black mb-1">Pending Fees</h3>
                      <p className="text-2xl font-bold">₹{dashboardData.fees.pending}</p>
                      <p className="text-sm opacity-90">Please clear your dues</p>
                    </div>
                    <button 
                      onClick={() => router.push('/student/fees')}
                      className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              {/* Performance Card - Enhanced */}
              {dashboardData?.classRank.rank && (
                <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white hover:shadow-purple-500/50 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                          width: `${Math.random() * 80 + 40}px`,
                          height: `${Math.random() * 80 + 40}px`,
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <FaChartLine className="text-4xl sm:text-5xl mr-2 sm:mr-3 animate-bounce-slow flex-shrink-0" />
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black">Your Rank</h2>
                        <p className="text-xs sm:text-sm opacity-90">Class position</p>
                      </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
                      <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <FaMedal className="text-yellow-300 text-5xl sm:text-6xl animate-bounce-slow" />
                      </div>
                      <p className="text-5xl sm:text-6xl md:text-7xl font-black neon-text mb-2">#{dashboardData.classRank.rank}</p>
                      <p className="text-xs sm:text-sm opacity-90">Out of {dashboardData.classRank.total} students</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {[
                        { label: 'Avg Score', value: dashboardData?.stats.avgPercentage || '0%', icon: '📊' },
                        { label: 'Overall', value: dashboardData?.stats.overallGrade || 'N/A', icon: '⭐' },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center">
                          <p className="text-2xl sm:text-3xl mb-1">{item.icon}</p>
                          <p className="text-xl sm:text-2xl font-black">{item.value}</p>
                          <p className="text-xs opacity-75">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => router.push('/student/grades')}
                      className="w-full mt-4 sm:mt-6 bg-white text-purple-600 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black hover:bg-gray-100 transition-all transform hover:scale-105 text-sm sm:text-base"
                    >
                      View Full Report
                    </button>
                  </div>
                </div>
              )}

              {/* Study Resources - Enhanced */}
              <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white hover:shadow-green-500/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute bg-white rounded-full"
                      style={{
                        width: `${Math.random() * 60 + 30}px`,
                        height: `${Math.random() * 60 + 30}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <FaBookOpen className="text-4xl sm:text-5xl mr-2 sm:mr-3 animate-bounce-slow flex-shrink-0" />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black">Study Materials</h2>
                      <p className="text-xs sm:text-sm opacity-90">{dashboardData?.lmsResources || 0} resources available</p>
                    </div>
                  </div>

                  {dashboardData?.lmsResources > 0 ? (
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 mb-4">
                      <p className="text-center">
                        <span className="text-3xl font-black">{dashboardData.lmsResources}</span>
                        <span className="text-sm ml-2">resources ready for you</span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 mb-4 text-center">
                      <p className="opacity-90">No study materials available yet</p>
                    </div>
                  )}

                  <button 
                    onClick={() => router.push('/student/lms')}
                    className="w-full bg-white text-green-600 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black hover:bg-gray-100 transition-all transform hover:scale-105 text-sm sm:text-base"
                  >
                    Browse All Materials
                  </button>
                </div>
              </div>

              {/* Upcoming Events */}
              <UpcomingEvents limit={5} />
            </div>
          </div>

          {/* Achievement Banner - Enhanced */}
          {parseFloat(dashboardData?.stats.avgPercentage) >= 75 && (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 text-white hover:shadow-blue-500/40 transition-all duration-500 animate-fadeInUp relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full filter blur-3xl top-0 left-0 animate-blob"></div>
                <div className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full filter blur-3xl bottom-0 right-0 animate-blob animation-delay-2000"></div>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <div className="flex items-center mb-4 sm:mb-6">
                    <FaAward className="text-5xl sm:text-6xl md:text-7xl mr-3 sm:mr-4 animate-bounce-slow flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-black neon-text mb-1 sm:mb-2">Excellent Work!</h3>
                      <p className="text-base sm:text-lg md:text-xl opacity-90 font-semibold">Keep it up!</p>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl opacity-90 leading-relaxed">
                    You&apos;re performing exceptionally well with an average of <strong className="text-yellow-300 font-black text-lg sm:text-xl md:text-2xl">{dashboardData?.stats.avgPercentage}</strong>!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: 'Attendance', value: dashboardData?.stats.attendanceRate || '0%', icon: '✅' },
                    { label: 'Avg Grade', value: dashboardData?.stats.overallGrade || 'N/A', icon: '⭐' },
                    { label: 'Rank', value: dashboardData?.classRank.rank ? `#${dashboardData.classRank.rank}` : 'N/A', icon: '🏆' },
                    { label: 'Performance', value: parseFloat(dashboardData?.stats.avgPercentage) >= 90 ? 'A+' : parseFloat(dashboardData?.stats.avgPercentage) >= 80 ? 'A' : 'B', icon: '📈' },
                  ].map((metric, i) => (
                    <div
                      key={i}
                      className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center hover:bg-white/30 transition-all hover:scale-105"
                    >
                      <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{metric.icon}</div>
                      <p className="text-2xl sm:text-3xl font-black mb-1">{metric.value}</p>
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
