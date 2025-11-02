import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { FaCalendarCheck, FaClipboardList, FaBook, FaMoneyBillWave, FaCamera, FaMapMarkerAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: 'My Attendance', value: '92%', icon: '📊', color: 'from-blue-500 to-blue-700', trend: '+5%' },
    { label: 'Classes Today', value: '5', icon: '📚', color: 'from-green-500 to-green-700', trend: 'Schedule' },
    { label: 'LMS Content', value: '12', icon: '💾', color: 'from-purple-500 to-purple-700', trend: '+3 new' },
    { label: 'This Month Salary', value: '₹45,000', icon: '💰', color: 'from-pink-500 to-pink-700', trend: 'Net Pay' }
  ];

  const todaySchedule = [
    { time: '09:00 AM', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 101' },
    { time: '10:00 AM', subject: 'Science', class: 'Class 10-B', room: 'Room 102' },
    { time: '11:00 AM', subject: 'Mathematics', class: 'Class 10-C', room: 'Room 101' },
    { time: '01:00 PM', subject: 'Science', class: 'Class 9-A', room: 'Lab 1' },
    { time: '02:00 PM', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 101' }
  ];

  const recentActivities = [
    { action: 'Marked attendance for Class 10-A', time: '2 hours ago', icon: '✅', color: 'text-green-600' },
    { action: 'Uploaded study material for Science', time: '5 hours ago', icon: '📚', color: 'text-blue-600' },
    { action: 'Entered grades for Mid-term exam', time: '1 day ago', icon: '📝', color: 'text-purple-600' },
    { action: 'Applied for leave (Nov 5-6)', time: '2 days ago', icon: '🏖️', color: 'text-yellow-600' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="modern-card p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Welcome Back, Teacher! 👋</h1>
              <p className="text-xl text-purple-100">Here's what's happening today</p>
            </div>
            <div className="text-7xl animate-bounce-slow">👨‍🏫</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="stat-card group"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</p>
                  <p className="text-4xl font-extrabold text-gradient">{stat.value}</p>
                </div>
                <div className="text-5xl group-hover:scale-125 transition-transform">
                  {stat.icon}
                </div>
              </div>
              <div className="text-xs text-gray-500 font-semibold">{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Schedule */}
        <div className="grid lg:grid-cols-3 gap-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          {/* Quick Actions */}
          <div className="modern-card p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">⚡</span>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full btn btn-primary justify-start text-left">
                <FaCamera className="mr-3" />
                Mark My Attendance
              </button>
              <button className="w-full btn btn-success justify-start text-left">
                <FaClipboardList className="mr-3" />
                Mark Student Attendance
              </button>
              <button className="w-full btn btn-warning justify-start text-left">
                <FaBook className="mr-3" />
                Upload Study Material
              </button>
              <button className="w-full btn btn-info justify-start text-left">
                <FaMoneyBillWave className="mr-3" />
                View Salary Details
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="lg:col-span-2 modern-card p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">📅</span>
              Today's Schedule
            </h2>
            <div className="space-y-3">
              {todaySchedule.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="w-20 text-center">
                    <div className="text-sm font-bold text-purple-600">{item.time}</div>
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className="font-bold text-gray-800">{item.subject}</h3>
                    <p className="text-sm text-gray-600">{item.class} • {item.room}</p>
                  </div>
                  <button className="btn btn-success text-sm py-2 px-4">
                    <FaCheckCircle className="mr-1" /> Mark
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">🕐</span>
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center p-5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`text-3xl mr-4 ${activity.color}`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
