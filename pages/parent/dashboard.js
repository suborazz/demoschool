import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import UpcomingEvents from '../../components/UpcomingEvents';
import { 
  FaUserGraduate, FaCheckCircle, FaTrophy, FaMoneyBillWave,
  FaCalendarCheck, FaBook, FaComments, FaChartLine, FaBell,
  FaDownload, FaCreditCard, FaEnvelope, FaStar, FaAward,
  FaClock, FaGraduationCap, FaChalkboardTeacher, FaArrowRight,
  FaExclamationCircle, FaHeartbeat, FaUsers
} from 'react-icons/fa';

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(0);

  const stats = [
    { 
      title: 'My Children', 
      value: '2', 
      icon: FaUsers, 
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      bgPattern: 'from-blue-50 to-cyan-50',
      subtitle: 'Enrolled students'
    },
    { 
      title: 'Avg Attendance', 
      value: '95%', 
      icon: FaCheckCircle, 
      gradient: 'from-green-500 via-green-600 to-emerald-500',
      bgPattern: 'from-green-50 to-emerald-50',
      subtitle: 'This month'
    },
    { 
      title: 'Overall Grade', 
      value: 'A', 
      icon: FaTrophy, 
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      bgPattern: 'from-yellow-50 to-orange-50',
      subtitle: 'Excellent'
    },
    { 
      title: 'Pending Fees', 
      value: '₹12,000', 
      icon: FaMoneyBillWave, 
      gradient: 'from-red-500 via-pink-500 to-rose-500',
      bgPattern: 'from-red-50 to-pink-50',
      subtitle: 'Due by Nov 15'
    },
  ];

  const children = [
    { 
      name: 'John Doe', 
      class: '10-A', 
      rollNo: '101', 
      grade: 'A', 
      attendance: '96%',
      subjects: 6,
      rank: 5,
      avatar: 'from-purple-500 to-pink-500',
      recentGrades: [
        { subject: 'Math', marks: '95/100', grade: 'A+' },
        { subject: 'Science', marks: '92/100', grade: 'A+' },
        { subject: 'English', marks: '88/100', grade: 'A' },
      ]
    },
    { 
      name: 'Jane Doe', 
      class: '8-B', 
      rollNo: '205', 
      grade: 'A+', 
      attendance: '94%',
      subjects: 6,
      rank: 2,
      avatar: 'from-blue-500 to-purple-500',
      recentGrades: [
        { subject: 'Math', marks: '98/100', grade: 'A+' },
        { subject: 'Science', marks: '96/100', grade: 'A+' },
        { subject: 'English', marks: '94/100', grade: 'A+' },
      ]
    },
  ];

  const quickActions = [
    { name: 'View Attendance', icon: FaCalendarCheck, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Check Grades', icon: FaTrophy, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Pay Fees', icon: FaCreditCard, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Contact Teacher', icon: FaEnvelope, gradient: 'from-orange-500 to-red-500' },
    { name: 'Download Reports', icon: FaDownload, gradient: 'from-pink-500 to-rose-500' },
    { name: 'View Timetable', icon: FaClock, gradient: 'from-indigo-500 to-purple-500' },
  ];

  const upcomingEvents = [
    { event: 'Parent-Teacher Meeting', date: 'Nov 5, 2025', type: 'Meeting', color: 'from-blue-500 to-purple-500' },
    { event: 'Unit Test - Mathematics', date: 'Nov 8, 2025', type: 'Exam', color: 'from-orange-500 to-red-500' },
    { event: 'Annual Sports Day', date: 'Nov 10, 2025', type: 'Event', color: 'from-green-500 to-emerald-500' },
  ];

  const notifications = [
    { message: 'Fee payment due in 3 days', icon: '💰', time: '1 hour ago', priority: 'high' },
    { message: 'New assignment uploaded', icon: '📝', time: '3 hours ago', priority: 'medium' },
    { message: 'Parent-teacher meeting scheduled', icon: '👥', time: '5 hours ago', priority: 'medium' },
  ];

  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section - Enhanced */}
          <div className="animate-fadeInUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient mb-3">Parent Dashboard</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-semibold">Track your child&apos;s progress and stay connected</p>
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
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Children Cards */}
            <div className="lg:col-span-2 space-y-8">
              {/* Children Profile Cards - Enhanced */}
              <div className="space-y-4 sm:space-y-6 animate-fadeInUp">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6">Your Children</h2>
                
                {children.map((child, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-4"
                  >
                    {/* Card Header with Gradient */}
                    <div className={`bg-gradient-to-r ${child.avatar} p-6 sm:p-8 relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                        {[...Array(5)].map((_, i) => (
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
                      
                      <div className="flex items-center relative z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white shadow-2xl flex items-center justify-center text-purple-600 text-2xl sm:text-3xl md:text-4xl font-black mr-4 sm:mr-6 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                          {child.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2 neon-text truncate">{child.name}</h3>
                          <p className="text-white/90 text-sm sm:text-base md:text-lg font-semibold">Class {child.class} • Roll No: {child.rollNo}</p>
                          <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <span className="px-3 sm:px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-bold">
                              🏆 Rank #{child.rank}
                            </span>
                            <span className="px-3 sm:px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-bold">
                              📚 {child.subjects} Subjects
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-6 md:p-8">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-all hover:scale-105">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 font-bold uppercase">Attendance</p>
                            <FaCheckCircle className="text-green-500 text-xl" />
                          </div>
                          <p className="text-3xl font-black text-green-600">{child.attendance}</p>
                          <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: child.attendance }}></div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-2xl border-2 border-yellow-200 hover:shadow-lg transition-all hover:scale-105">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 font-bold uppercase">Overall Grade</p>
                            <FaTrophy className="text-yellow-500 text-xl" />
                          </div>
                          <p className="text-3xl font-black text-yellow-600">{child.grade}</p>
                          <div className="flex gap-1 mt-3">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className="text-yellow-400 text-lg" />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recent Grades */}
                      <div>
                        <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">Recent Grades</h4>
                        <div className="space-y-2 sm:space-y-3">
                          {child.recentGrades.map((grade, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:shadow-md transition-all hover:scale-102"
                            >
                              <div className="flex items-center min-w-0 flex-1">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                  <FaBook className="text-white text-sm sm:text-base" />
                                </div>
                                <span className="font-bold text-gray-900 text-sm sm:text-base truncate">{grade.subject}</span>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                <span className="text-gray-700 font-semibold text-xs sm:text-sm">{grade.marks}</span>
                                <span className="px-2 sm:px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs sm:text-sm font-black shadow-lg">
                                  {grade.grade}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
                        <button className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
                          📊 Full Report
                        </button>
                        <button className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
                          ✉️ Message
                        </button>
                        <button className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105">
                          💰 Pay Fees
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 sm:mb-8">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      <div className="relative text-center">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${action.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                          <action.icon className="text-white text-xl sm:text-2xl" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-white transition-colors">{action.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              {/* Fee Payment Card - Enhanced */}
              <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white hover:shadow-green-500/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
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
                    <FaCreditCard className="text-4xl sm:text-5xl mr-3 sm:mr-4 animate-bounce-slow" />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black">Pay Fees</h3>
                      <p className="text-xs sm:text-sm opacity-90">Quick & Secure</p>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm opacity-90 mb-2">Total Pending</p>
                    <p className="text-3xl sm:text-4xl font-black mb-1">₹12,000</p>
                    <p className="text-xs sm:text-sm opacity-90">Due: Nov 15, 2025</p>
                  </div>

                  <button className="w-full bg-white text-green-600 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
                    Pay Now →
                  </button>
                </div>
              </div>

              {/* Notifications - Enhanced */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-500/20 transition-all duration-500">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">Notifications</h2>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-black animate-pulse">
                    {notifications.length}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {notifications.map((notif, index) => (
                    <div
                      key={index}
                      className={`p-3 sm:p-4 rounded-xl border-l-4 ${
                        notif.priority === 'high' ? 'bg-red-50 border-red-500' : 'bg-purple-50 border-purple-500'
                      } hover:shadow-lg transition-all hover:-translate-y-1`}
                    >
                      <div className="flex items-start">
                        <span className="text-2xl sm:text-3xl mr-2 sm:mr-3 flex-shrink-0">{notif.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-xs sm:text-sm">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <FaClock className="mr-1 flex-shrink-0" />
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-3 sm:mt-4 text-purple-600 font-bold hover:text-purple-700 transition-colors text-sm sm:text-base">
                  View All Notifications →
                </button>
              </div>

              {/* Upcoming Events */}
              <UpcomingEvents limit={5} />
            </div>
          </div>

          {/* Teacher Communication - Enhanced */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 text-white hover:shadow-blue-500/40 transition-all duration-500 animate-fadeInUp relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full filter blur-3xl top-0 left-0 animate-blob"></div>
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full filter blur-3xl bottom-0 right-0 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-4 justify-center md:justify-start">
                  <FaComments className="text-4xl sm:text-5xl mb-3 sm:mb-0 sm:mr-4 animate-bounce-slow" />
                  <div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black neon-text">Need to Contact a Teacher?</h3>
                    <p className="text-sm sm:text-base md:text-lg opacity-90 font-semibold">We&apos;re here to help your child succeed</p>
                  </div>
                </div>
              </div>
              <button className="group bg-white text-purple-600 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-black text-base sm:text-lg md:text-xl shadow-2xl hover:bg-gray-100 transition-all transform hover:scale-110 flex items-center whitespace-nowrap">
                Send Message
                <FaArrowRight className="ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
