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
  FaDownload, FaPrint, FaSearch, FaFilter, FaSchool, FaSpinner, FaBook, FaSyncAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import UpcomingEvents from '../../components/UpcomingEvents';

export default function AdminDashboard() {
  const router = useRouter();
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useCallback(async (showToast = false, range = timeRange) => {
    try {
      if (showToast) {
        toast.loading('Refreshing dashboard...', { id: 'refresh' });
      } else {
        setLoading(true);
      }
      const response = await axios.get(`/api/admin/dashboard?timeRange=${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.data);
      if (showToast) {
        toast.success('Dashboard refreshed!', { id: 'refresh' });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data', { id: 'refresh' });
    } finally {
      if (!showToast) {
        setLoading(false);
      }
    }
  }, [token, timeRange]);

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
      title: `Revenue ${dashboardData?.rangeLabel || 'This Month'}`, 
      value: dashboardData ? formatCurrency(dashboardData.stats.revenue) : '₹0', 
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
    { name: 'Timetable', icon: FaClock, gradient: 'from-violet-500 to-purple-500', action: '/admin/timetable' },
    { name: 'View Calendar', icon: FaCalendarAlt, gradient: 'from-teal-500 to-cyan-500', action: '/admin/calendar' },
    { name: 'Notifications', icon: FaBell, gradient: 'from-yellow-500 to-orange-500', action: '/admin/notifications' },
  ];

  // Get data from API
  const recentActivities = dashboardData?.recentActivities || [];
  const classOccupancy = dashboardData?.classOccupancy || [];

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
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-semibold">
                Welcome back! Manage your school effectively.
              </p>
              {dashboardData && (
                <div className="flex gap-4 mt-2">
                  <span className="text-sm text-gray-500">
                    <FaUserGraduate className="inline mr-1" />
                    {dashboardData.todaySummary.presentStudents}/{dashboardData.todaySummary.totalStudents} Students Present
                  </span>
                  <span className="text-sm text-gray-500">
                    <FaChalkboardTeacher className="inline mr-1" />
                    {dashboardData.todaySummary.presentStaff}/{dashboardData.todaySummary.totalStaff} Staff Present
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 md:mt-0">
              <button 
                onClick={() => fetchDashboardData(true)}
                className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm sm:text-base"
              >
                <FaSyncAlt className="mr-2" />
                Refresh
              </button>
              <button className="inline-flex items-center justify-center bg-white border-2 border-purple-300 text-purple-600 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-purple-50 transition-all text-sm sm:text-base">
                <FaDownload className="mr-2" />
                Export
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

          {/* Time Range Stats */}
          {dashboardData && (dashboardData.stats.recentStudents > 0 || dashboardData.stats.recentStaff > 0) && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaStar />
                New Additions {dashboardData.rangeLabel}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-2xl font-black">{dashboardData.stats.recentStudents}</p>
                  <p className="text-sm opacity-90">New Students</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-2xl font-black">{dashboardData.stats.recentStaff}</p>
                  <p className="text-sm opacity-90">New Staff</p>
                </div>
              </div>
            </div>
          )}

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

              {/* Recent Activity */}
              {recentActivities.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Recent Activity</h2>
                    <span className="text-sm text-gray-500 font-semibold">{dashboardData?.rangeLabel || 'This Month'}</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {recentActivities.map((item, index) => (
                      <div
                        key={index}
                        className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-transparent hover:border-purple-500 gap-2 sm:gap-0"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            item.icon === 'student' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {item.icon === 'student' ? (
                              <FaUserGraduate className="text-blue-600" />
                            ) : (
                              <FaChalkboardTeacher className="text-green-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-gray-900 block text-sm sm:text-base truncate">{item.message}</span>
                            <span className="text-xs text-gray-500">{item.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center ml-12 sm:ml-0">
                          <FaClock className="text-gray-400 mr-1 sm:mr-2 text-sm" />
                          <span className="text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap">
                            {new Date(item.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - 1 col */}
            <div className="space-y-6 sm:space-y-8">
              {/* Class Occupancy */}
              {classOccupancy.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">Class Occupancy</h2>
                    <FaSchool className="text-3xl text-purple-600" />
                  </div>

                  <div className="space-y-4">
                    {classOccupancy.map((cls, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{cls.name}</p>
                            <p className="text-xs text-gray-500">Grade {cls.grade} {cls.section}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-purple-600">{cls.students}/{cls.capacity}</p>
                            <p className="text-xs text-gray-500">{cls.occupancy}% full</p>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              parseInt(cls.occupancy) >= 90 ? 'bg-red-500' :
                              parseInt(cls.occupancy) >= 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${cls.occupancy}%` }}
                          />
                        </div>
                      </div>
                    ))}
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

              {/* Upcoming Events */}
              <UpcomingEvents limit={5} />
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
