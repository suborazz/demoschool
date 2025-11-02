import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaCalendarCheck, FaCheckCircle, FaTimes, FaClock, FaChartPie, FaDownload, FaTrophy, FaFire } from 'react-icons/fa';

const StudentAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState('November 2024');

  const stats = [
    { label: 'This Month', value: '92%', icon: '📊', color: 'from-blue-500 to-blue-700', status: 'Excellent!' },
    { label: 'Present Days', value: '22', icon: '✅', color: 'from-green-500 to-green-700', status: 'Great' },
    { label: 'Absent Days', value: '2', icon: '❌', color: 'from-red-500 to-red-700', status: 'Low' },
    { label: 'Current Streak', value: '7 days', icon: '🔥', color: 'from-orange-500 to-orange-700', status: 'On Fire!' }
  ];

  const monthlyData = [
    { month: 'Aug', percentage: 85, color: 'bg-blue-400' },
    { month: 'Sep', percentage: 88, color: 'bg-green-400' },
    { month: 'Oct', percentage: 90, color: 'bg-purple-400' },
    { month: 'Nov', percentage: 92, color: 'bg-pink-400' }
  ];

  const attendanceRecords = [
    { date: '2024-11-14', day: 'Thursday', status: 'present', time: '08:45 AM' },
    { date: '2024-11-13', day: 'Wednesday', status: 'present', time: '08:50 AM' },
    { date: '2024-11-12', day: 'Tuesday', status: 'absent', time: '-' },
    { date: '2024-11-11', day: 'Monday', status: 'present', time: '08:48 AM' },
    { date: '2024-11-09', day: 'Saturday', status: 'present', time: '08:52 AM' },
    { date: '2024-11-08', day: 'Friday', status: 'present', time: '08:47 AM' },
    { date: '2024-11-07', day: 'Thursday', status: 'present', time: '08:45 AM' },
    { date: '2024-11-06', day: 'Wednesday', status: 'present', time: '08:49 AM' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-gradient-to-br from-green-400 to-green-600';
      case 'absent': return 'bg-gradient-to-br from-red-400 to-red-600';
      case 'late': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      default: return 'bg-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">My Attendance</h1>
            <p className="text-gray-600 text-lg">Track your attendance and maintain consistency</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaDownload className="mr-2" />
            Download Report
          </button>
        </div>

        {/* Achievement Banner */}
        <div className="modern-card p-8 bg-gradient-to-r from-orange-600 to-red-600 text-white animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                <FaFire className="text-6xl animate-pulse-slow" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold mb-2">7 Day Streak! 🔥</h2>
                <p className="text-xl text-orange-100">You've been present for 7 consecutive days! Keep it up!</p>
              </div>
            </div>
            <div className="text-8xl animate-bounce-slow">🏆</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn" style={{animationDelay: '0.1s'}}>
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="stat-card group"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</p>
                  <p className="text-4xl font-extrabold text-gradient">{stat.value}</p>
                </div>
                <div className="text-5xl group-hover:scale-125 transition-transform">
                  {stat.icon}
                </div>
              </div>
              <div className="text-xs text-purple-600 font-bold">{stat.status}</div>
            </div>
          ))}
        </div>

        {/* Monthly Trend */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <FaChartPie className="mr-3 text-purple-600" />
            Monthly Attendance Trend
          </h2>

          <div className="flex items-end justify-around h-80 mb-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="text-2xl font-bold text-gradient mb-2 group-hover:scale-110 transition-transform">
                  {data.percentage}%
                </div>
                <div 
                  className={`w-20 ${data.color} rounded-t-2xl shadow-xl hover:shadow-2xl transition-all relative group-hover:scale-105`}
                  style={{height: `${data.percentage * 3}px`}}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.percentage >= 90 ? '⭐' : data.percentage >= 75 ? '👍' : '💪'}
                  </div>
                </div>
                <div className="mt-3 font-bold text-gray-700">{data.month}</div>
              </div>
            ))}
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
            <p className="text-green-700 font-bold text-lg">
              📈 Your attendance is improving! Keep up the great work!
            </p>
          </div>
        </div>

        {/* Attendance Calendar */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaCalendarCheck className="mr-3 text-purple-600" />
              Attendance Records
            </h2>
            <select 
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none font-semibold"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option>November 2024</option>
              <option>October 2024</option>
              <option>September 2024</option>
            </select>
          </div>

          <div className="space-y-3">
            {attendanceRecords.map((record, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-5 rounded-xl ${getStatusColor(record.status)} text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all animate-fadeInUp`}
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold">{new Date(record.date).getDate()}</div>
                      <div className="text-xs">{record.day.slice(0, 3)}</div>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{record.day}</p>
                    <p className="text-sm opacity-90">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl mb-1">
                    {record.status === 'present' ? '✅' : record.status === 'absent' ? '❌' : '⏰'}
                  </div>
                  <div className="text-sm font-semibold">{record.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="modern-card p-8 bg-gradient-to-br from-yellow-50 to-orange-50 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaTrophy className="mr-3 text-yellow-500 text-3xl" />
            Attendance Badges Earned
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🔥', label: '7 Day Streak', earned: true, color: 'from-orange-400 to-orange-600' },
              { icon: '⭐', label: 'Perfect Month', earned: false, color: 'from-gray-300 to-gray-400' },
              { icon: '💯', label: '90% Club', earned: true, color: 'from-green-400 to-green-600' },
              { icon: '👑', label: 'Attendance King', earned: false, color: 'from-gray-300 to-gray-400' }
            ].map((badge, index) => (
              <div 
                key={index} 
                className={`text-center p-6 rounded-2xl ${badge.earned ? 'bg-white shadow-xl hover:shadow-2xl' : 'bg-gray-100'} transition-all hover:-translate-y-2`}
              >
                <div className={`text-5xl mb-3 ${badge.earned ? 'animate-bounce-slow' : 'grayscale opacity-50'}`}>
                  {badge.icon}
                </div>
                <p className={`font-bold text-sm ${badge.earned ? 'text-gray-800' : 'text-gray-400'}`}>
                  {badge.label}
                </p>
                {badge.earned && <div className="text-xs text-green-600 font-bold mt-1">✓ Earned</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
