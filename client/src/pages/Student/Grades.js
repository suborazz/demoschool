import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaGraduationCap, FaTrophy, FaStar, FaMedal, FaChartLine, FaDownload, FaFire } from 'react-icons/fa';

const StudentGrades = () => {
  const [selectedExam, setSelectedExam] = useState('Mid-term 2024');

  const stats = [
    { label: 'Overall Grade', value: 'A', icon: '🏆', color: 'from-green-500 to-green-700', status: 'Excellent' },
    { label: 'Average %', value: '91.2%', icon: '📊', color: 'from-blue-500 to-blue-700', status: 'Outstanding' },
    { label: 'Class Rank', value: '#3', icon: '🥉', color: 'from-purple-500 to-purple-700', status: 'Top 10%' },
    { label: 'Best Subject', value: 'CS', icon: '💻', color: 'from-pink-500 to-pink-700', status: '97%' }
  ];

  const subjects = [
    { name: 'Computer Science', marks: 97, total: 100, grade: 'A+', percentage: 97, icon: '💻', color: 'from-indigo-400 to-indigo-600', rank: 1 },
    { name: 'Mathematics', marks: 95, total: 100, grade: 'A+', percentage: 95, icon: '🔢', color: 'from-blue-400 to-blue-600', rank: 1 },
    { name: 'English', marks: 92, total: 100, grade: 'A+', percentage: 92, icon: '📖', color: 'from-purple-400 to-purple-600', rank: 2 },
    { name: 'Hindi', marks: 90, total: 100, grade: 'A+', percentage: 90, icon: '🇮🇳', color: 'from-pink-400 to-pink-600', rank: 3 },
    { name: 'Science', marks: 88, total: 100, grade: 'A', percentage: 88, icon: '🔬', color: 'from-green-400 to-green-600', rank: 4 },
    { name: 'Social Studies', marks: 85, total: 100, grade: 'A', percentage: 85, icon: '🌍', color: 'from-yellow-400 to-yellow-600', rank: 5 }
  ];

  const getGradeEmoji = (grade) => {
    if (grade === 'A+') return '🌟';
    if (grade === 'A') return '⭐';
    if (grade === 'B+' || grade === 'B') return '👍';
    return '💪';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">My Grades</h1>
            <p className="text-gray-600 text-lg">Track your academic performance and achievements</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaDownload className="mr-2" />
            Download Report Card
          </button>
        </div>

        {/* Achievement Banner */}
        <div className="modern-card p-8 bg-gradient-to-r from-green-600 to-teal-600 text-white animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                <FaTrophy className="text-6xl animate-bounce-slow" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold mb-2">Outstanding Performance! 🎉</h2>
                <p className="text-xl text-green-100">You're in the Top 10% of your class with an A grade!</p>
              </div>
            </div>
            <div className="text-8xl animate-pulse-slow">⭐</div>
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
              <div className="text-xs text-green-600 font-bold">{stat.status}</div>
            </div>
          ))}
        </div>

        {/* Subject Performance */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaChartLine className="mr-3 text-purple-600" />
              Subject-wise Performance
            </h2>
            <select className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none font-semibold">
              <option>Mid-term 2024</option>
              <option>Final 2024</option>
              <option>Unit Test</option>
            </select>
          </div>

          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div 
                key={index}
                className="modern-card p-6 hover-lift group animate-fadeInUp"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5 flex-1">
                    {/* Subject Icon */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                      {subject.icon}
                    </div>

                    {/* Subject Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-800">{subject.name}</h3>
                        <span className="text-3xl">{getGradeEmoji(subject.grade)}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div 
                            className={`h-4 rounded-full bg-gradient-to-r ${subject.color} transition-all duration-1000 flex items-center justify-end pr-2`}
                            style={{width: `${subject.percentage}%`}}
                          >
                            <span className="text-white text-xs font-bold">{subject.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grade Display */}
                    <div className="text-right">
                      <div className={`text-5xl font-extrabold ${
                        subject.grade === 'A+' ? 'text-green-600' :
                        subject.grade === 'A' ? 'text-blue-600' : 'text-yellow-600'
                      } mb-2`}>
                        {subject.grade}
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {subject.marks}/{subject.total}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Rank #{subject.rank}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements & Badges */}
        <div className="modern-card p-8 bg-gradient-to-br from-purple-50 to-pink-50 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaMedal className="mr-3 text-yellow-500 text-3xl" />
            Academic Achievements
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🌟', label: 'Top in CS', sublabel: '97% Score', color: 'from-indigo-500 to-indigo-700', earned: true },
              { icon: '💯', label: 'Perfect in Maths', sublabel: '95% Score', color: 'from-blue-500 to-blue-700', earned: true },
              { icon: '🎯', label: 'Consistent A+', sublabel: '4 Subjects', color: 'from-green-500 to-green-700', earned: true },
              { icon: '📈', label: 'Most Improved', sublabel: '+8% Growth', color: 'from-purple-500 to-purple-700', earned: true }
            ].map((achievement, index) => (
              <div key={index} className={`text-center p-6 rounded-2xl bg-gradient-to-br ${achievement.color} text-white shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all`}>
                <div className="text-6xl mb-3 animate-bounce-slow">{achievement.icon}</div>
                <p className="font-bold text-lg mb-1">{achievement.label}</p>
                <p className="text-sm opacity-90">{achievement.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentGrades;
