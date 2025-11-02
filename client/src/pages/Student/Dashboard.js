import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaCalendarCheck, FaGraduationCap, FaBook, FaBell, FaTrophy, FaStar } from 'react-icons/fa';

const StudentDashboard = () => {
  const stats = [
    { label: 'My Attendance', value: '88%', icon: '📊', color: 'from-blue-500 to-blue-700', status: 'Good' },
    { label: 'Average Grade', value: 'A', icon: '🏆', color: 'from-green-500 to-green-700', status: 'Excellent' },
    { label: 'Pending Assignments', value: '3', icon: '📝', color: 'from-yellow-500 to-yellow-700', status: 'Due Soon' },
    { label: 'Notifications', value: '5', icon: '🔔', color: 'from-pink-500 to-pink-700', status: 'New' }
  ];

  const todayClasses = [
    { time: '09:00 AM', subject: 'Mathematics', teacher: 'Mr. John Teacher', room: 'Room 101', status: 'Completed' },
    { time: '10:00 AM', subject: 'Science', teacher: 'Mrs. Smith', room: 'Lab 1', status: 'Completed' },
    { time: '11:00 AM', subject: 'English', teacher: 'Ms. Brown', room: 'Room 102', status: 'In Progress' },
    { time: '01:00 PM', subject: 'History', teacher: 'Mr. Davis', room: 'Room 103', status: 'Upcoming' },
    { time: '02:00 PM', subject: 'Computer Science', teacher: 'Mrs. Wilson', room: 'Computer Lab', status: 'Upcoming' }
  ];

  const recentGrades = [
    { subject: 'Mathematics', exam: 'Mid-term', marks: '95/100', grade: 'A+', color: 'text-green-600' },
    { subject: 'Science', exam: 'Unit Test', marks: '88/100', grade: 'A', color: 'text-blue-600' },
    { subject: 'English', exam: 'Mid-term', marks: '92/100', grade: 'A+', color: 'text-green-600' },
    { subject: 'History', exam: 'Assignment', marks: '85/100', grade: 'A', color: 'text-blue-600' }
  ];

  const recentActivities = [
    { action: 'Submitted assignment for Mathematics', time: '2 hours ago', icon: '✅', color: 'text-green-600' },
    { action: 'Completed Science video lesson', time: '5 hours ago', icon: '🎥', color: 'text-blue-600' },
    { action: 'Downloaded English study material', time: '1 day ago', icon: '📚', color: 'text-purple-600' },
    { action: 'Scored 95/100 in Maths quiz', time: '2 days ago', icon: '💯', color: 'text-yellow-600' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="modern-card p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Welcome Back, Sarah! 👋</h1>
              <p className="text-xl text-blue-100">Ready to learn something new today?</p>
            </div>
            <div className="text-7xl animate-bounce-slow">👨‍🎓</div>
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
              <div className="text-xs text-purple-600 font-semibold">{stat.status}</div>
            </div>
          ))}
        </div>

        {/* Today's Timetable & Recent Grades */}
        <div className="grid lg:grid-cols-2 gap-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          {/* Today's Timetable */}
          <div className="modern-card p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">📅</span>
              Today's Timetable
            </h2>
            <div className="space-y-3">
              {todayClasses.map((cls, index) => (
                <div 
                  key={index}
                  className={`flex items-center p-4 rounded-xl transition-all ${
                    cls.status === 'Completed' ? 'bg-green-50 border-2 border-green-200' :
                    cls.status === 'In Progress' ? 'bg-blue-50 border-2 border-blue-300 shadow-lg' :
                    'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <div className="w-16 text-center">
                    <div className={`text-sm font-bold ${
                      cls.status === 'In Progress' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {cls.time}
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className="font-bold text-gray-800">{cls.subject}</h3>
                    <p className="text-sm text-gray-600">{cls.teacher} • {cls.room}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    cls.status === 'Completed' ? 'bg-green-200 text-green-700' :
                    cls.status === 'In Progress' ? 'bg-blue-200 text-blue-700 animate-pulse' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {cls.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Grades */}
          <div className="modern-card p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">🏆</span>
              Recent Grades
            </h2>
            <div className="space-y-4">
              {recentGrades.map((grade, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg transition-all"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{grade.subject}</h3>
                    <p className="text-sm text-gray-600">{grade.exam}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-extrabold ${grade.color} mb-1`}>
                      {grade.grade}
                    </div>
                    <div className="text-sm text-gray-600">{grade.marks}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">📋</span>
            Recent Activities
          </h2>
          <div className="space-y-3">
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

        {/* Achievements */}
        <div className="modern-card p-8 bg-gradient-to-br from-yellow-50 to-orange-50 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">🌟</span>
            Your Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🏆', label: 'Top in Mathematics', color: 'from-yellow-400 to-yellow-600' },
              { icon: '⭐', label: 'Perfect Attendance', color: 'from-blue-400 to-blue-600' },
              { icon: '📚', label: 'Best Assignment', color: 'from-green-400 to-green-600' },
              { icon: '💯', label: 'Full Marks', color: 'from-purple-400 to-purple-600' }
            ].map((achievement, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-white shadow hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="text-5xl mb-2">{achievement.icon}</div>
                <p className="text-sm font-bold text-gray-800">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
