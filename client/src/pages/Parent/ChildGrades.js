import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FaGraduationCap, FaTrophy, FaStar, FaChartLine, FaDownload, FaMedal } from 'react-icons/fa';

const ChildGrades = () => {
  const { childId } = useParams();
  const [selectedExam, setSelectedExam] = useState('Mid-term 2024');

  const stats = [
    { label: 'Overall Grade', value: 'A', icon: '🏆', color: 'from-green-500 to-green-700' },
    { label: 'Average %', value: '91.2%', icon: '📊', color: 'from-blue-500 to-blue-700' },
    { label: 'Rank in Class', value: '#3', icon: '🥉', color: 'from-purple-500 to-purple-700' },
    { label: 'Total Subjects', value: '6', icon: '📚', color: 'from-pink-500 to-pink-700' }
  ];

  const subjects = [
    { name: 'Mathematics', marks: 95, total: 100, grade: 'A+', percentage: 95, icon: '🔢', color: 'from-blue-400 to-blue-600' },
    { name: 'Science', marks: 88, total: 100, grade: 'A', percentage: 88, icon: '🔬', color: 'from-green-400 to-green-600' },
    { name: 'English', marks: 92, total: 100, grade: 'A+', percentage: 92, icon: '📖', color: 'from-purple-400 to-purple-600' },
    { name: 'Social Studies', marks: 85, total: 100, grade: 'A', percentage: 85, icon: '🌍', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Hindi', marks: 90, total: 100, grade: 'A+', percentage: 90, icon: '🇮🇳', color: 'from-pink-400 to-pink-600' },
    { name: 'Computer Science', marks: 97, total: 100, grade: 'A+', percentage: 97, icon: '💻', color: 'from-indigo-400 to-indigo-600' }
  ];

  const getGradeColor = (grade) => {
    if (grade === 'A+') return 'text-green-600';
    if (grade === 'A') return 'text-blue-600';
    if (grade === 'B+' || grade === 'B') return 'text-yellow-600';
    return 'text-gray-600';
  };

  const topSubjects = subjects.sort((a, b) => b.percentage - a.percentage).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Child Grades</h1>
            <p className="text-gray-600 text-lg">View your child's academic performance</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaDownload className="mr-2" />
            Download Report Card
          </button>
        </div>

        {/* Child Info Card */}
        <div className="modern-card p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                <span className="text-5xl">👧</span>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold mb-2">Sarah Student</h2>
                <p className="text-xl text-blue-100">Class 10-A • Mid-term Examination 2024</p>
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

        {/* Top Performing Subjects */}
        <div className="modern-card p-8 bg-gradient-to-br from-yellow-50 to-orange-50 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaTrophy className="mr-3 text-yellow-500 text-3xl" />
            Top Performing Subjects
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {topSubjects.map((subject, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all"
              >
                <div className="text-6xl mb-3">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>
                <div className="text-4xl font-extrabold text-green-600 mb-2">{subject.grade}</div>
                <div className="text-lg text-gray-600">{subject.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject-wise Performance */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaChartLine className="mr-3 text-purple-600" />
              Subject-wise Performance
            </h2>
            <select className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none font-semibold">
              <option>Mid-term 2024</option>
              <option>Final 2024</option>
              <option>Unit Test 1</option>
            </select>
          </div>

          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeInUp"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-3xl shadow-lg`}>
                      {subject.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full bg-gradient-to-r ${subject.color} transition-all duration-1000`}
                          style={{width: `${subject.percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className={`text-4xl font-extrabold ${getGradeColor(subject.grade)} mb-1`}>
                      {subject.grade}
                    </div>
                    <div className="text-lg text-gray-600 font-semibold">
                      {subject.marks}/{subject.total}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subject.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="modern-card p-8 bg-gradient-to-br from-purple-50 to-pink-50 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaMedal className="mr-3 text-yellow-500 text-3xl" />
            Academic Achievements
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '🌟', label: 'Top in Maths', color: 'from-yellow-400 to-yellow-600' },
              { icon: '💯', label: 'Full Marks in CS', color: 'from-green-400 to-green-600' },
              { icon: '🎯', label: 'Consistent Performer', color: 'from-blue-400 to-blue-600' },
              { icon: '📈', label: 'Improved Score', color: 'from-purple-400 to-purple-600' }
            ].map((achievement, index) => (
              <div key={index} className="text-center p-5 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all">
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <p className="font-bold text-gray-800 text-sm">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChildGrades;
