import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaBook, FaVideo, FaFilePdf, FaFileAlt, FaPlay, FaDownload, FaCheckCircle, FaClock, FaFire, FaStar } from 'react-icons/fa';

const StudentLMS = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Content', icon: '📚', count: 12, color: 'from-purple-500 to-purple-700' },
    { id: 'videos', name: 'Videos', icon: '🎥', count: 4, color: 'from-red-500 to-red-700' },
    { id: 'documents', name: 'Documents', icon: '📄', count: 5, color: 'from-blue-500 to-blue-700' },
    { id: 'assignments', name: 'Assignments', icon: '📝', count: 3, color: 'from-green-500 to-green-700' }
  ];

  const stats = [
    { label: 'Completed', value: '8', icon: '✅', color: 'from-green-500 to-green-700' },
    { label: 'In Progress', value: '3', icon: '⏳', color: 'from-blue-500 to-blue-700' },
    { label: 'Pending', value: '1', icon: '📌', color: 'from-yellow-500 to-yellow-700' },
    { label: 'Study Time', value: '12h', icon: '⏰', color: 'from-purple-500 to-purple-700' }
  ];

  const learningContent = [
    { 
      id: 1, 
      title: 'Introduction to Algebra', 
      subject: 'Mathematics',
      type: 'video', 
      duration: '45 min',
      progress: 100,
      status: 'completed',
      icon: '🎥',
      color: 'from-red-400 to-red-600'
    },
    { 
      id: 2, 
      title: 'Chemical Reactions Chapter', 
      subject: 'Science',
      type: 'document', 
      pages: '25 pages',
      progress: 75,
      status: 'in-progress',
      icon: '📄',
      color: 'from-blue-400 to-blue-600'
    },
    { 
      id: 3, 
      title: 'Quadratic Equations Assignment', 
      subject: 'Mathematics',
      type: 'assignment', 
      dueDate: 'Nov 20',
      progress: 0,
      status: 'pending',
      submissions: '18/35',
      icon: '📝',
      color: 'from-green-400 to-green-600'
    },
    { 
      id: 4, 
      title: 'Physics - Laws of Motion', 
      subject: 'Physics',
      type: 'video', 
      duration: '30 min',
      progress: 100,
      status: 'completed',
      icon: '🎥',
      color: 'from-purple-400 to-purple-600'
    },
    { 
      id: 5, 
      title: 'English Grammar Notes', 
      subject: 'English',
      type: 'document', 
      pages: '15 pages',
      progress: 60,
      status: 'in-progress',
      icon: '📄',
      color: 'from-pink-400 to-pink-600'
    },
    { 
      id: 6, 
      title: 'Computer Programming Basics', 
      subject: 'Computer Science',
      type: 'video', 
      duration: '60 min',
      progress: 100,
      status: 'completed',
      icon: '🎥',
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

  const filteredContent = selectedCategory === 'all' 
    ? learningContent 
    : learningContent.filter(c => c.type === selectedCategory.slice(0, -1));

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="badge badge-success">✓ Completed</span>;
      case 'in-progress': return <span className="badge badge-warning">⏳ In Progress</span>;
      case 'pending': return <span className="badge badge-danger">📌 Pending</span>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Learning Materials</h1>
            <p className="text-gray-600 text-lg">Access study materials, videos, and assignments</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold flex items-center">
              <FaFire className="mr-2 text-orange-500" />
              5 Day Study Streak!
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="modern-card p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold mb-2">Keep Learning, Sarah! 📚</h2>
              <p className="text-xl text-purple-100">You have 1 pending assignment due on Nov 20</p>
            </div>
            <div className="text-8xl animate-bounce-slow">🎓</div>
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
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-4 overflow-x-auto animate-fadeIn" style={{animationDelay: '0.2s'}}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all whitespace-nowrap flex items-center space-x-3 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-xl scale-105`
                  : 'bg-white text-gray-700 shadow hover:shadow-xl hover:scale-105'
              }`}
            >
              <span className="text-3xl">{category.icon}</span>
              <div className="text-left">
                <div>{category.name}</div>
                <div className="text-xs opacity-80">{category.count} items</div>
              </div>
            </button>
          ))}
        </div>

        {/* Learning Content Grid */}
        <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((content, index) => (
              <div 
                key={content.id}
                className="modern-card group hover-lift animate-fadeInUp"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                {/* Content Header */}
                <div className={`h-40 rounded-t-2xl bg-gradient-to-br ${content.color} p-6 flex flex-col justify-between -m-8 mb-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 text-9xl opacity-20">
                    {content.icon}
                  </div>
                  <div className="relative z-10">
                    <span className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-bold">
                      {content.subject}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white line-clamp-2">
                      {content.title}
                    </h3>
                  </div>
                </div>

                {/* Progress Bar */}
                {content.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 font-semibold">Progress</span>
                      <span className="text-purple-600 font-bold">{content.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${content.color} transition-all duration-1000`}
                        style={{width: `${content.progress}%`}}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Content Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="badge badge-info capitalize">{content.type}</span>
                  </div>
                  {content.duration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-800">{content.duration}</span>
                    </div>
                  )}
                  {content.pages && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pages:</span>
                      <span className="font-semibold text-gray-800">{content.pages}</span>
                    </div>
                  )}
                  {content.dueDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-semibold text-red-600">{content.dueDate}</span>
                    </div>
                  )}
                  {content.submissions && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-semibold text-gray-800">{content.submissions}</span>
                    </div>
                  )}
                  <div>
                    {getStatusBadge(content.status)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {content.type === 'video' && (
                    <button className="btn btn-primary text-sm py-3 flex items-center justify-center">
                      <FaPlay className="mr-2" /> Watch
                    </button>
                  )}
                  {content.type === 'document' && (
                    <button className="btn btn-info text-sm py-3 flex items-center justify-center">
                      <FaBook className="mr-2" /> Read
                    </button>
                  )}
                  {content.type === 'assignment' && (
                    <button className="btn btn-success text-sm py-3 flex items-center justify-center">
                      <FaFileAlt className="mr-2" /> Submit
                    </button>
                  )}
                  <button className="btn btn-secondary text-sm py-3 flex items-center justify-center">
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Achievements */}
        <div className="modern-card p-8 bg-gradient-to-br from-blue-50 to-purple-50 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaStar className="mr-3 text-yellow-500 text-3xl" />
            Study Achievements
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🔥', label: '5 Day Streak', desc: 'Learning daily', color: 'from-orange-500 to-orange-700', earned: true },
              { icon: '📚', label: 'Bookworm', desc: '20 materials read', color: 'from-blue-500 to-blue-700', earned: true },
              { icon: '🎯', label: 'On Time', desc: 'All assignments submitted', color: 'from-green-500 to-green-700', earned: true },
              { icon: '⭐', label: 'Star Learner', desc: '100% completion', color: 'from-purple-500 to-purple-700', earned: false }
            ].map((achievement, index) => (
              <div 
                key={index} 
                className={`text-center p-6 rounded-2xl ${
                  achievement.earned 
                    ? `bg-gradient-to-br ${achievement.color} text-white shadow-xl hover:shadow-2xl` 
                    : 'bg-gray-100 text-gray-400'
                } transition-all hover:-translate-y-2`}
              >
                <div className={`text-6xl mb-3 ${achievement.earned ? 'animate-bounce-slow' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <p className="font-bold text-lg mb-1">{achievement.label}</p>
                <p className="text-xs opacity-80">{achievement.desc}</p>
                {achievement.earned && (
                  <div className="mt-2">
                    <span className="text-xs bg-white/30 px-3 py-1 rounded-full font-bold">✓ Earned</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentLMS;
