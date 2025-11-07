import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FaUsers, FaChalkboardTeacher, FaUserGraduate, FaMoneyBillWave, 
  FaChartLine, FaUserPlus, FaFileInvoice, FaClipboardCheck, 
  FaCalendarAlt, FaBell, FaTrophy, FaArrowUp, FaArrowDown,
  FaClock, FaCheckCircle, FaExclamationTriangle, FaStar,
  FaDownload, FaPrint, FaSearch, FaFilter, FaSchool, FaSpinner, FaBook
} from 'react-icons/fa';

export default function AdminDashboard() {
  const router = useRouter();
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch dashboard data
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const stats = [
    { 
      title: 'Total Students', 
      value: dashboardData?.stats.totalStudents || 0, 
      icon: FaUserGraduate, 
      gradient: 'from-blue-500 via-blue-600 to-cyan-500', 
      bgPattern: 'from-blue-50 to-cyan-50'
    },
    { 
      title: 'Total Staff', 
      value: dashboardData?.stats.totalStaff || 0, 
      icon: FaChalkboardTeacher, 
      gradient: 'from-green-500 via-green-600 to-emerald-500', 
      bgPattern: 'from-green-50 to-emerald-50'
    },
    { 
      title: 'Total Parents', 
      value: dashboardData?.stats.totalParents || 0, 
      icon: FaUsers, 
      gradient: 'from-purple-500 via-purple-600 to-pink-500', 
      bgPattern: 'from-purple-50 to-pink-50'
    },
    { 
      title: 'Revenue This Month', 
      value: dashboardData ? formatCurrency(dashboardData.stats.monthlyRevenue) : '₹0', 
      icon: FaMoneyBillWave, 
      gradient: 'from-yellow-500 via-orange-500 to-red-500', 
      bgPattern: 'from-yellow-50 to-orange-50'
    },
  ];

  const quickActions = [
    { name: 'Add Student', icon: FaUserPlus, gradient: 'from-blue-500 to-cyan-500', action: '/admin/students' },
    { name: 'Add Staff', icon: FaChalkboardTeacher, gradient: 'from-green-500 to-emerald-500', action: '/admin/staff' },
    { name: 'Subjects', icon: FaBook, gradient: 'from-indigo-500 to-blue-500', action: '/admin/subjects' },
    { name: 'Manage Fees', icon: FaFileInvoice, gradient: 'from-purple-500 to-pink-500', action: '/admin/fees' },
    { name: 'View Reports', icon: FaChartLine, gradient: 'from-orange-500 to-red-500', action: '/admin/reports' },
    { name: 'Attendance', icon: FaClipboardCheck, gradient: 'from-pink-500 to-rose-500', action: '/admin/attendance' },
    { name: 'Manage Classes', icon: FaSchool, gradient: 'from-indigo-500 to-purple-500', action: '/admin/classes' },
    { name: 'View Calendar', icon: FaCalendarAlt, gradient: 'from-teal-500 to-cyan-500', action: '/admin/calendar' },
    { name: 'Notifications', icon: FaBell, gradient: 'from-yellow-500 to-orange-500', action: '/admin/notifications' },
  ];

  // Hide demo data - these should come from database
  const recentActivities = [];
  const pendingTasks = [];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
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
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section - Enhanced */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between animate-fadeInUp">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient mb-2 sm:mb-3">Admin Dashboard</h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-semibold">Welcome back! Here&apos;s what&apos;s happening today.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 md:mt-0">
              <button className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm sm:text-base">
                <FaDownload className="mr-2" />
                Export Data
              </button>
              <button className="inline-flex items-center justify-center bg-white border-2 border-purple-300 text-purple-600 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-purple-50 transition-all text-sm sm:text-base">
                <FaPrint className="mr-2" />
                Print
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-wrap gap-2 sm:gap-3 animate-fadeInUp">
            {['Today', 'Week', 'Month', 'Year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range.toLowerCase())}
                className={`px-4 sm:px-5 md:px-6 py-2 rounded-xl font-bold transition-all text-sm sm:text-base ${
                  timeRange === range.toLowerCase()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {range}
              </button>
            ))}
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
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${stat.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0`}>
                      <stat.icon className="text-white text-2xl sm:text-2xl md:text-3xl" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-gray-600 text-xs sm:text-sm font-bold mb-2 uppercase tracking-wide">{stat.title}</h3>
                  <p className="text-3xl sm:text-4xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">{stat.value}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 sm:mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`} style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - 2 cols */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Quick Actions - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500 animate-fadeInUp">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Quick Actions</h2>
                  <span className="text-xs sm:text-sm text-gray-500 font-semibold">9 available actions</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(action.action)}
                      className="group relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
                    >
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      <div className="relative text-center">
                        <div className={`w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-gradient-to-br ${action.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                          <action.icon className="text-white text-xl sm:text-xl md:text-2xl" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-white transition-colors">{action.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Charts Section - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Performance Overview</h2>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 sm:px-4 py-2 bg-purple-100 text-purple-600 rounded-lg font-bold text-xs sm:text-sm hover:bg-purple-200 transition-all">
                      Attendance
                    </button>
                    <button className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-200 transition-all">
                      Revenue
                    </button>
                  </div>
                </div>

                {/* Chart Placeholder - Beautiful */}
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 h-56 sm:h-64 md:h-72 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-purple-400 rounded-full filter blur-2xl"
                        style={{
                          width: `${Math.random() * 100 + 50}px`,
                          height: `${Math.random() * 100 + 50}px`,
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="relative text-center">
                    <FaChartLine className="text-purple-400 text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3 sm:mb-4 mx-auto animate-pulse-slow" />
                    <p className="text-gray-600 font-bold text-base sm:text-lg md:text-xl">Performance Chart</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Analytics visualization will appear here</p>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  {[
                    { label: 'Attendance Rate', value: dashboardData?.metrics.attendanceRate || '0%', color: 'text-green-600' },
                    { label: 'Fee Collection', value: dashboardData?.metrics.feeCollectionRate || '0%', color: 'text-blue-600' },
                    { label: 'Pass Rate', value: dashboardData?.metrics.passRate || '0%', color: 'text-purple-600' }
                  ].map((mini, i) => (
                    <div key={i} className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                      <p className={`text-2xl sm:text-3xl font-black ${mini.color} mb-1`}>{mini.value}</p>
                      <p className="text-xs text-gray-600 font-semibold">{mini.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity - Hidden until we have real data */}
              {recentActivities.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Recent Activity</h2>
                    <button className="text-purple-600 font-bold hover:text-purple-700 transition-colors text-sm sm:text-base self-start sm:self-auto">
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {recentActivities.map((item, index) => (
                      <div
                        key={index}
                        className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-transparent hover:border-purple-500 gap-2 sm:gap-0"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="text-3xl sm:text-4xl mr-3 sm:mr-4 transform group-hover:scale-125 transition-transform flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-gray-900 block text-sm sm:text-base truncate">{item.action}</span>
                            <span className="text-xs sm:text-sm text-gray-500 truncate block">{item.user}</span>
                          </div>
                        </div>
                        <div className="flex items-center ml-12 sm:ml-0">
                          <FaClock className="text-gray-400 mr-1 sm:mr-2 text-sm" />
                          <span className="text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - 1 col */}
            <div className="space-y-6 sm:space-y-8">
              {/* Pending Tasks - Hidden until we have real data */}
              {pendingTasks.length > 0 && (
                <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white hover:shadow-orange-500/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
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
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-black">Pending Tasks</h2>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-black text-sm sm:text-base">{pendingTasks.length}</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {pendingTasks.map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all cursor-pointer group gap-2"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <FaCheckCircle className="mr-2 sm:mr-3 text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0" />
                          <span className="font-semibold text-sm sm:text-base truncate">{task.task}</span>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-black flex-shrink-0 ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}>
                          {task.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 sm:mt-6 bg-white text-purple-600 py-2.5 sm:py-3 rounded-xl font-black hover:bg-gray-100 transition-all transform hover:scale-105 text-sm sm:text-base">
                    View All Tasks
                  </button>
                </div>
              </div>
              )}

              {/* Quick Stats - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">Today&apos;s Summary</h2>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: 'Present Students', value: dashboardData?.todaySummary.presentStudents || 0, icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Present Staff', value: dashboardData?.todaySummary.presentStaff || 0, icon: FaCheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending Fees', value: dashboardData ? formatCurrency(dashboardData.stats.pendingFees) : '₹0', icon: FaExclamationTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Total Classes', value: dashboardData?.stats.totalClasses || 0, icon: FaSchool, color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 sm:p-4 ${item.bg} rounded-xl hover:shadow-lg transition-all hover:scale-105`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <item.icon className={`${item.color} text-xl sm:text-2xl mr-2 sm:mr-3 flex-shrink-0`} />
                        <span className="font-bold text-gray-900 text-sm sm:text-base truncate">{item.label}</span>
                      </div>
                      <span className={`text-xl sm:text-2xl font-black ${item.color} flex-shrink-0`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Upcoming Events - Hidden until we have real data */}
          {false && (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white hover:shadow-blue-500/40 transition-all duration-500 animate-fadeInUp">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 sm:gap-0">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-3xl sm:text-4xl mr-3 sm:mr-4 animate-bounce-slow flex-shrink-0" />
                  <h2 className="text-2xl sm:text-3xl font-black">Upcoming Events</h2>
                </div>
                <button className="px-4 sm:px-6 py-2 bg-white/20 backdrop-blur-md rounded-xl font-bold hover:bg-white/30 transition-all text-sm sm:text-base self-start sm:self-auto">
                  View Calendar
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { event: 'Parent-Teacher Meeting', date: 'Nov 5, 2025', time: '10:00 AM' },
                  { event: 'Annual Sports Day', date: 'Nov 10, 2025', time: '9:00 AM' },
                  { event: 'Science Exhibition', date: 'Nov 15, 2025', time: '11:00 AM' },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="p-4 sm:p-5 md:p-6 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all hover:scale-105"
                  >
                    <p className="font-black text-base sm:text-lg mb-2">{event.event}</p>
                    <div className="flex items-center text-xs sm:text-sm opacity-90 mb-1">
                      <FaCalendarAlt className="mr-2 flex-shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm opacity-90">
                      <FaClock className="mr-2 flex-shrink-0" />
                      <span>{event.time}</span>
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
