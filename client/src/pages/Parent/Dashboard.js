import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FaChild, FaCalendarCheck, FaGraduationCap, FaMoneyBillWave, FaEye, FaFileDownload, FaCreditCard } from 'react-icons/fa';

const ParentDashboard = () => {
  const children = [
    {
      id: 1,
      name: 'Sarah Student',
      class: 'Class 10-A',
      rollNo: '001',
      attendance: '88%',
      grade: 'A',
      pendingFees: 15000,
      profileColor: 'from-blue-400 to-blue-600'
    }
  ];

  const stats = [
    { label: 'My Children', value: children.length, icon: '👧', color: 'from-blue-500 to-blue-700' },
    { label: 'Avg Attendance', value: '92%', icon: '📊', color: 'from-green-500 to-green-700' },
    { label: 'Average Grade', value: 'A', icon: '🏆', color: 'from-purple-500 to-purple-700' },
    { label: 'Pending Fees', value: '₹15,000', icon: '💰', color: 'from-red-500 to-red-700' }
  ];

  const notifications = [
    { title: 'Parent-Teacher Meeting', desc: 'Scheduled for Nov 10, 2024', time: '1 day ago', icon: '📅', color: 'text-blue-600' },
    { title: 'Fee Payment Reminder', desc: 'Term 2 fees due on Nov 15', time: '2 days ago', icon: '💰', color: 'text-red-600' },
    { title: 'Exam Schedule Released', desc: 'Final exams from Dec 1-15', time: '3 days ago', icon: '📝', color: 'text-purple-600' },
    { title: 'Report Card Available', desc: 'Mid-term report card ready', time: '5 days ago', icon: '📊', color: 'text-green-600' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="modern-card p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Welcome Back, Parent! 👋</h1>
              <p className="text-xl text-purple-100">Monitor your child's progress and activities</p>
            </div>
            <div className="text-7xl animate-bounce-slow">👨‍👩‍👧</div>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</p>
                  <p className="text-4xl font-extrabold text-gradient">{stat.value}</p>
                </div>
                <div className="text-5xl group-hover:scale-125 transition-transform">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Children Cards */}
        <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">👧</span>
            My Children
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {children.map((child, index) => (
              <div 
                key={child.id}
                className="modern-card group hover-lift"
              >
                {/* Child Header */}
                <div className={`h-32 rounded-t-2xl bg-gradient-to-br ${child.profileColor} p-6 flex items-center justify-between -m-8 mb-6`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-3xl shadow-xl">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white mb-1">
                        {child.name}
                      </h3>
                      <p className="text-white/90 font-semibold">
                        {child.class} • Roll No: {child.rollNo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Child Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 text-center">
                    <div className="text-3xl font-extrabold text-blue-600 mb-1">{child.attendance}</div>
                    <div className="text-xs text-blue-700 font-semibold">Attendance</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 text-center">
                    <div className="text-3xl font-extrabold text-green-600 mb-1">{child.grade}</div>
                    <div className="text-xs text-green-700 font-semibold">Average Grade</div>
                  </div>
                </div>

                {/* Pending Fees Alert */}
                {child.pendingFees > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-700 font-semibold mb-1">Pending Fees</p>
                        <p className="text-2xl font-extrabold text-red-600">₹{child.pendingFees.toLocaleString()}</p>
                      </div>
                      <button className="btn btn-danger text-sm py-2 px-4">
                        <FaCreditCard className="mr-1" /> Pay Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Link to={`/parent/attendance/${child.id}`} className="btn btn-info text-xs py-3">
                    <FaCalendarCheck className="mx-auto mb-1" />
                    Attendance
                  </Link>
                  <Link to={`/parent/grades/${child.id}`} className="btn btn-success text-xs py-3">
                    <FaGraduationCap className="mx-auto mb-1" />
                    Grades
                  </Link>
                  <Link to={`/parent/fees/${child.id}`} className="btn btn-warning text-xs py-3">
                    <FaMoneyBillWave className="mx-auto mb-1" />
                    Fees
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">🔔</span>
            Recent Notifications
          </h2>
          <div className="space-y-3">
            {notifications.map((notif, index) => (
              <div 
                key={index}
                className="flex items-center p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`text-3xl mr-4 ${notif.color}`}>
                  {notif.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{notif.title}</h3>
                  <p className="text-sm text-gray-600">{notif.desc}</p>
                </div>
                <div className="text-xs text-gray-500">{notif.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
