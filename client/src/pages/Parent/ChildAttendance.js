import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FaCalendarAlt, FaCheckCircle, FaTimes, FaClock, FaChartPie, FaDownload, FaFilter } from 'react-icons/fa';

const ChildAttendance = () => {
  const { childId } = useParams();
  const [selectedMonth, setSelectedMonth] = useState('November 2024');

  const stats = [
    { label: 'Total Days', value: '24', icon: '📅', color: 'from-blue-500 to-blue-700', emoji: '📊' },
    { label: 'Present', value: '21', icon: '✅', color: 'from-green-500 to-green-700', emoji: '👍' },
    { label: 'Absent', value: '2', icon: '❌', color: 'from-red-500 to-red-700', emoji: '❗' },
    { label: 'Attendance %', value: '87.5%', icon: '📊', color: 'from-purple-500 to-purple-700', emoji: '💯' }
  ];

  const attendanceData = [
    { date: '2024-11-01', status: 'present', day: 'Friday' },
    { date: '2024-11-02', status: 'present', day: 'Saturday' },
    { date: '2024-11-04', status: 'absent', day: 'Monday' },
    { date: '2024-11-05', status: 'present', day: 'Tuesday' },
    { date: '2024-11-06', status: 'present', day: 'Wednesday' },
    { date: '2024-11-07', status: 'present', day: 'Thursday' },
    { date: '2024-11-08', status: 'present', day: 'Friday' },
    { date: '2024-11-09', status: 'present', day: 'Saturday' },
    { date: '2024-11-11', status: 'present', day: 'Monday' },
    { date: '2024-11-12', status: 'absent', day: 'Tuesday' },
    { date: '2024-11-13', status: 'present', day: 'Wednesday' },
    { date: '2024-11-14', status: 'present', day: 'Thursday' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-gradient-to-br from-green-400 to-green-600 text-white';
      case 'absent': return 'bg-gradient-to-br from-red-400 to-red-600 text-white';
      case 'late': return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <FaCheckCircle className="text-2xl" />;
      case 'absent': return <FaTimes className="text-2xl" />;
      case 'late': return <FaClock className="text-2xl" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Child Attendance</h1>
            <p className="text-gray-600 text-lg">Track your child's attendance records</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaDownload className="mr-2" />
            Download Report
          </button>
        </div>

        {/* Child Info Card */}
        <div className="modern-card p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-fadeIn">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
              <span className="text-5xl font-bold">S</span>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-extrabold mb-2">Sarah Student</h2>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold">
                  Class 10-A
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold">
                  Roll No: 001
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold">
                  Admission: ADM2024001
                </span>
              </div>
            </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</p>
                  <p className="text-4xl font-extrabold text-gradient">{stat.value}</p>
                </div>
                <div className="text-5xl group-hover:scale-125 transition-transform">
                  {stat.emoji}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance Visualization */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaChartPie className="mr-3 text-purple-600" />
              Attendance Visualization
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

          {/* Circular Progress */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient-green)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${87.5 * 4.4} ${100 * 4.4}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-gradient">87.5%</div>
                    <div className="text-xs text-gray-500 font-semibold">Attendance</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg">
                      <FaCheckCircle className="text-white text-2xl" />
                    </div>
                    <div>
                      <p className="text-green-700 font-semibold">Present Days</p>
                      <p className="text-sm text-green-600">Excellent attendance!</p>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-green-600">21</div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                      <FaTimes className="text-white text-2xl" />
                    </div>
                    <div>
                      <p className="text-red-700 font-semibold">Absent Days</p>
                      <p className="text-sm text-red-600">Room for improvement</p>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-red-600">2</div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                      <FaClock className="text-white text-2xl" />
                    </div>
                    <div>
                      <p className="text-blue-700 font-semibold">On Time</p>
                      <p className="text-sm text-blue-600">Punctual student</p>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-blue-600">95%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaCalendarAlt className="mr-3 text-purple-600" />
            Attendance Calendar - {selectedMonth}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {attendanceData.map((record, index) => (
              <div 
                key={index}
                className={`${getStatusColor(record.status)} p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-center animate-fadeInUp`}
                style={{animationDelay: `${index * 0.03}s`}}
              >
                <div className="text-3xl mb-2">
                  {getStatusIcon(record.status)}
                </div>
                <div className="text-2xl font-extrabold mb-1">
                  {new Date(record.date).getDate()}
                </div>
                <div className="text-xs opacity-90 font-semibold">{record.day}</div>
                <div className="text-xs opacity-80 mt-1 capitalize font-semibold">{record.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">🕐</span>
            Recent Attendance Activity
          </h2>
          
          <div className="space-y-3">
            {attendanceData.slice(0, 5).reverse().map((record, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-5 rounded-xl transition-all hover:shadow-lg ${
                  record.status === 'present' ? 'bg-green-50 border-2 border-green-200' : 
                  'bg-red-50 border-2 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                    record.status === 'present' ? 'bg-gradient-to-br from-green-500 to-green-700' : 
                    'bg-gradient-to-br from-red-500 to-red-700'
                  }`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{record.day}</p>
                    <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`badge ${
                  record.status === 'present' ? 'badge-success' : 'badge-danger'
                }`}>
                  {record.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChildAttendance;
