import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaGraduationCap, FaPlus, FaSearch, FaChartLine, FaTrophy, FaStar, FaEdit } from 'react-icons/fa';

const ManageGrades = () => {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedExam, setSelectedExam] = useState('Mid-term');

  const stats = [
    { label: 'Total Students', value: '35', icon: '👨‍🎓', color: 'from-blue-500 to-blue-700' },
    { label: 'Grades Entered', value: '28', icon: '✅', color: 'from-green-500 to-green-700' },
    { label: 'Pending', value: '7', icon: '⏳', color: 'from-yellow-500 to-yellow-700' },
    { label: 'Class Average', value: '85%', icon: '📊', color: 'from-purple-500 to-purple-700' }
  ];

  const students = [
    { id: 1, name: 'Sarah Student', rollNo: '001', marks: 95, total: 100, grade: 'A+', percentage: 95, status: 'entered' },
    { id: 2, name: 'John Doe', rollNo: '002', marks: 88, total: 100, grade: 'A', percentage: 88, status: 'entered' },
    { id: 3, name: 'Emma Wilson', rollNo: '003', marks: 92, total: 100, grade: 'A+', percentage: 92, status: 'entered' },
    { id: 4, name: 'Michael Brown', rollNo: '004', marks: null, total: 100, grade: '-', percentage: 0, status: 'pending' },
    { id: 5, name: 'Sophia Davis', rollNo: '005', marks: 78, total: 100, grade: 'B+', percentage: 78, status: 'entered' }
  ];

  const topPerformers = students
    .filter(s => s.marks !== null)
    .sort((a, b) => b.marks - a.marks)
    .slice(0, 3);

  const getGradeColor = (grade) => {
    if (grade === 'A+') return 'text-green-600';
    if (grade === 'A') return 'text-blue-600';
    if (grade === 'B+' || grade === 'B') return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Manage Grades</h1>
            <p className="text-gray-600 text-lg">Enter and manage student examination grades</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaPlus className="mr-2" />
            Bulk Import Grades
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
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

        {/* Filters & Top Performers */}
        <div className="grid lg:grid-cols-3 gap-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          {/* Filters */}
          <div className="lg:col-span-2 modern-card p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🔍</span>
              Select Class & Exam
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">Class</label>
                <select 
                  className="input"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option>10-A</option>
                  <option>10-B</option>
                  <option>10-C</option>
                </select>
              </div>
              <div>
                <label className="label">Subject</label>
                <select 
                  className="input"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="label">Exam Type</label>
                <select 
                  className="input"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  <option>Mid-term</option>
                  <option>Final</option>
                  <option>Unit Test</option>
                </select>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="modern-card p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <FaTrophy className="text-yellow-500 mr-2 text-2xl" />
              Top 3 Performers
            </h3>
            <div className="space-y-3">
              {topPerformers.map((student, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                    'bg-gradient-to-br from-orange-400 to-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                    <p className="text-xs text-gray-600">{student.marks} marks</p>
                  </div>
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Entry Table */}
        <div className="modern-card overflow-hidden animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">
              Enter Grades - {selectedClass} • {selectedSubject} • {selectedExam}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
                    <td>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="font-mono font-semibold text-purple-600">{student.rollNo}</td>
                    <td>
                      {student.status === 'entered' ? (
                        <span className="text-2xl font-bold text-gray-800">{student.marks}</span>
                      ) : (
                        <input
                          type="number"
                          className="w-20 px-3 py-2 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none font-bold text-center"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                      )}
                    </td>
                    <td className="font-semibold">{student.total}</td>
                    <td>
                      <span className="text-xl font-bold text-gray-800">{student.percentage}%</span>
                    </td>
                    <td>
                      <span className={`text-2xl font-extrabold ${getGradeColor(student.grade)}`}>
                        {student.grade}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        student.status === 'entered' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-info text-sm py-2 px-4">
                        <FaEdit className="mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageGrades;
