import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaChartBar,
  FaCalendarCheck,
  FaGraduationCap,
  FaBook,
  FaSignOutAlt,
  FaCog,
  FaUserGraduate,
  FaChild,
  FaBell,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: FaHome, color: 'from-blue-500 to-blue-700' },
          { path: '/admin/students', label: 'Students', icon: FaUserGraduate, color: 'from-green-500 to-green-700' },
          { path: '/admin/staff', label: 'Staff', icon: FaUserTie, color: 'from-purple-500 to-purple-700' },
          { path: '/admin/classes', label: 'Classes', icon: FaChalkboardTeacher, color: 'from-yellow-500 to-yellow-700' },
          { path: '/admin/fees', label: 'Fees', icon: FaMoneyBillWave, color: 'from-pink-500 to-pink-700' },
          { path: '/admin/reports', label: 'Reports', icon: FaChartBar, color: 'from-indigo-500 to-indigo-700' },
        ];
      case 'staff':
        return [
          { path: '/staff/dashboard', label: 'Dashboard', icon: FaHome, color: 'from-blue-500 to-blue-700' },
          { path: '/staff/attendance', label: 'Attendance', icon: FaCalendarCheck, color: 'from-green-500 to-green-700' },
          { path: '/staff/grades', label: 'Grades', icon: FaGraduationCap, color: 'from-purple-500 to-purple-700' },
          { path: '/staff/lms', label: 'LMS', icon: FaBook, color: 'from-pink-500 to-pink-700' },
        ];
      case 'parent':
        return [
          { path: '/parent/dashboard', label: 'Dashboard', icon: FaHome, color: 'from-blue-500 to-blue-700' },
        ];
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: FaHome, color: 'from-blue-500 to-blue-700' },
          { path: '/student/attendance', label: 'Attendance', icon: FaCalendarCheck, color: 'from-green-500 to-green-700' },
          { path: '/student/grades', label: 'Grades', icon: FaGraduationCap, color: 'from-purple-500 to-purple-700' },
          { path: '/student/lms', label: 'LMS', icon: FaBook, color: 'from-pink-500 to-pink-700' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-xl relative z-50 sticky top-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-xl hover:bg-purple-50 transition-colors lg:hidden"
              >
                {sidebarOpen ? <FaTimes size={24} className="text-purple-600" /> : <FaBars size={24} className="text-purple-600" />}
              </button>
              
              <Link to="/" className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                  <FaGraduationCap className="text-white text-2xl" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-gradient block">DAV School</span>
                  <span className="text-xs text-gray-500 font-semibold">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Portal
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-3 rounded-xl hover:bg-purple-50 transition-colors">
                <FaBell className="text-gray-600 text-xl" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.firstName?.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-danger flex items-center"
              >
                <FaSignOutAlt className="mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0 lg:w-72'} transition-all duration-300 bg-white shadow-2xl min-h-screen overflow-hidden`}>
          <nav className="mt-8 px-4">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-6 py-4 mb-2 rounded-xl font-semibold transition-all transform hover:scale-105 hover:shadow-lg ${
                    isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105` 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                  }`}
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all ${
                    isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.color} text-white`
                  }`}>
                    <item.icon className={`text-lg ${isActive ? 'text-white' : ''}`} />
                  </div>
                  {item.label}
                </Link>
              );
            })}

            {/* Settings */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link
                to="/settings"
                className="flex items-center px-6 py-4 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 font-semibold transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center mr-3 text-white">
                  <FaCog className="text-lg" />
                </div>
                Settings
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
