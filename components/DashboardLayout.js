import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-2">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-shrink">
              <Link href="/" className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 hover:text-purple-700 whitespace-nowrap">
                School
              </Link>
              <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                {user?.role?.toUpperCase()}
              </span>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
              {/* Home Link - Hidden on mobile */}
              <Link href="/" className="hidden md:flex items-center text-gray-600 hover:text-gray-900">
                <FaHome className="mr-2" />
                <span>Home</span>
              </Link>
              
              {/* Home Icon Only - Visible on mobile */}
              <Link href="/" className="md:hidden flex items-center text-gray-600 hover:text-gray-900 p-2">
                <FaHome className="text-xl" />
              </Link>

              {/* Notification Bell */}
              <NotificationBell />
              
              {/* User Info */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user?.firstName?.charAt(0)}
                </div>
                <span className="hidden sm:inline font-semibold text-sm md:text-base truncate max-w-[100px] md:max-w-[150px]">
                  {user?.firstName}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center text-red-600 hover:text-red-700 font-semibold flex-shrink-0"
                title="Logout"
              >
                <FaSignOutAlt className="text-lg sm:text-base sm:mr-2" />
                <span className="hidden sm:inline text-sm md:text-base">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

