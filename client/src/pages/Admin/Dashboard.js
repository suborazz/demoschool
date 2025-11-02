import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import {
  FaUserGraduate,
  FaUserTie,
  FaUsers,
  FaMoneyBillWave,
  FaChalkboardTeacher,
  FaCalendarCheck,
  FaTrophy,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    counts: { students: 0, staff: 0, parents: 0, classes: 0 },
    attendance: { staffPresent: 0, studentsPresent: 0 },
    fees: { pending: 0, collected: 0 },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/admin/dashboard');
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="loader mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const StatCard = ({ icon: Icon, title, value, trend, trendValue, color, bgGradient, iconBg }) => (
    <div className={`stat-card relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgGradient} rounded-full filter blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-500 text-sm font-semibold mb-1">{title}</p>
            <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
          </div>
          <div className={`${iconBg} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="text-white text-2xl" />
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center text-sm">
            <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
              {trend === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {trendValue}%
            </div>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">Welcome back! Here's what's happening today.</p>
          </div>
          <button className="btn btn-primary flex items-center shadow-xl">
            <FaChartLine className="mr-2" />
            View Reports
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          <StatCard
            icon={FaUserGraduate}
            title="Total Students"
            value={stats.counts.students}
            trend="up"
            trendValue="12"
            color="text-blue-600"
            bgGradient="bg-gradient-to-br from-blue-400 to-blue-600"
            iconBg="bg-gradient-to-br from-blue-500 to-blue-700"
          />
          <StatCard
            icon={FaUserTie}
            title="Total Staff"
            value={stats.counts.staff}
            trend="up"
            trendValue="5"
            color="text-green-600"
            bgGradient="bg-gradient-to-br from-green-400 to-green-600"
            iconBg="bg-gradient-to-br from-green-500 to-green-700"
          />
          <StatCard
            icon={FaUsers}
            title="Total Parents"
            value={stats.counts.parents}
            trend="up"
            trendValue="8"
            color="text-purple-600"
            bgGradient="bg-gradient-to-br from-purple-400 to-purple-600"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <StatCard
            icon={FaChalkboardTeacher}
            title="Total Classes"
            value={stats.counts.classes}
            color="text-yellow-600"
            bgGradient="bg-gradient-to-br from-yellow-400 to-yellow-600"
            iconBg="bg-gradient-to-br from-yellow-500 to-yellow-700"
          />
          <StatCard
            icon={FaCalendarCheck}
            title="Staff Present Today"
            value={stats.attendance.staffPresent}
            trend="up"
            trendValue="3"
            color="text-indigo-600"
            bgGradient="bg-gradient-to-br from-indigo-400 to-indigo-600"
            iconBg="bg-gradient-to-br from-indigo-500 to-indigo-700"
          />
          <StatCard
            icon={FaTrophy}
            title="Students Present"
            value={stats.attendance.studentsPresent}
            trend="up"
            trendValue="7"
            color="text-pink-600"
            bgGradient="bg-gradient-to-br from-pink-400 to-pink-600"
            iconBg="bg-gradient-to-br from-pink-500 to-pink-700"
          />
        </div>

        {/* Fee Statistics - Beautiful Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <div className="modern-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400 to-green-600 rounded-full filter blur-3xl opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaMoneyBillWave className="mr-3 text-green-600" />
                  Fee Statistics
                </h2>
                <span className="badge badge-success">Active</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Total Collected</span>
                    <span className="text-3xl font-extrabold text-green-600">
                      ₹{stats.fees.collected.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full animate-pulse-slow" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Pending Amount</span>
                    <span className="text-3xl font-extrabold text-red-600">
                      ₹{stats.fees.pending.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modern-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full filter blur-3xl opacity-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="btn btn-primary py-4 text-sm">
                  <FaUserGraduate className="mr-2" />
                  Add Student
                </button>
                <button className="btn btn-success py-4 text-sm">
                  <FaUserTie className="mr-2" />
                  Add Staff
                </button>
                <button className="btn btn-warning py-4 text-sm">
                  <FaChalkboardTeacher className="mr-2" />
                  Create Class
                </button>
                <button className="btn btn-info py-4 text-sm">
                  <FaChartLine className="mr-2" />
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="modern-card animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Student Additions</h2>
            <button className="text-purple-600 hover:text-purple-800 font-semibold text-sm">
              View All →
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Email</th>
                  <th>Date Added</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((activity, index) => (
                    <tr key={activity._id}>
                      <td className="font-semibold">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold mr-3">
                            {activity.user?.firstName?.charAt(0)}
                          </div>
                          {activity.user?.firstName} {activity.user?.lastName}
                        </div>
                      </td>
                      <td>{activity.class?.name || 'N/A'}</td>
                      <td className="text-gray-600">{activity.user?.email}</td>
                      <td className="text-gray-600">{new Date(activity.createdAt).toLocaleDateString()}</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-8">
                      <div className="text-6xl mb-3">📚</div>
                      No recent activities
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
