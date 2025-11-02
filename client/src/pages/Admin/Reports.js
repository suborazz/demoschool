import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaDownload, 
  FaCalendarAlt,
  FaUserGraduate,
  FaUserTie,
  FaMoneyBillWave,
  FaFileExcel,
  FaFilePdf
} from 'react-icons/fa';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Reports', icon: FaChartBar, color: 'from-blue-500 to-blue-700', emoji: '📊', desc: 'Student & Staff attendance analytics' },
    { id: 'fees', name: 'Fee Reports', icon: FaMoneyBillWave, color: 'from-green-500 to-green-700', emoji: '💰', desc: 'Collection and pending fee analysis' },
    { id: 'grades', name: 'Grade Reports', icon: FaChartLine, color: 'from-purple-500 to-purple-700', emoji: '📈', desc: 'Academic performance tracking' },
    { id: 'salary', name: 'Salary Reports', icon: FaUserTie, color: 'from-pink-500 to-pink-700', emoji: '💵', desc: 'Staff salary and payroll' }
  ];

  const quickStats = [
    { label: 'Total Reports', value: '24', icon: '📄', color: 'from-blue-500 to-blue-700' },
    { label: 'This Month', value: '8', icon: '📅', color: 'from-green-500 to-green-700' },
    { label: 'Downloads', value: '156', icon: '⬇️', color: 'from-purple-500 to-purple-700' },
    { label: 'Scheduled', value: '5', icon: '⏰', color: 'from-pink-500 to-pink-700' }
  ];

  const recentReports = [
    { name: 'Monthly Attendance Report - October 2024', date: '2024-10-31', type: 'Attendance', size: '2.4 MB' },
    { name: 'Fee Collection Report Q3 2024', date: '2024-10-28', type: 'Fees', size: '1.8 MB' },
    { name: 'Grade Report - Mid Term Exams', date: '2024-10-25', type: 'Grades', size: '3.2 MB' },
    { name: 'Staff Salary Report - October', date: '2024-10-30', type: 'Salary', size: '1.1 MB' },
    { name: 'Student Enrollment Report', date: '2024-10-20', type: 'General', size: '890 KB' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Reports & Analytics</h1>
            <p className="text-gray-600 text-lg">Generate and download comprehensive reports</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="btn btn-success flex items-center shadow-xl">
              <FaFileExcel className="mr-2" />
              Export Excel
            </button>
            <button className="btn btn-danger flex items-center shadow-xl">
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
          {quickStats.map((stat, index) => (
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

        {/* Report Type Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          {reportTypes.map((report, index) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`modern-card group text-center transition-all ${
                selectedReport === report.id ? 'ring-4 ring-purple-300 scale-105' : ''
              }`}
            >
              <div className="text-6xl mb-4 group-hover:scale-125 transition-transform">
                {report.emoji}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{report.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{report.desc}</p>
              <div className={`w-full h-1 rounded-full bg-gradient-to-r ${report.color} ${
                selectedReport === report.id ? 'opacity-100' : 'opacity-0'
              } transition-opacity`}></div>
            </button>
          ))}
        </div>

        {/* Generate Report Section */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaChartPie className="mr-3 text-purple-600" />
            Generate {reportTypes.find(r => r.id === selectedReport)?.name || 'Report'}
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="label">Report Type</label>
              <select className="input">
                <option>Detailed Report</option>
                <option>Summary Report</option>
                <option>Comparative Report</option>
              </select>
            </div>

            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" />
            </div>

            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" />
            </div>
          </div>

          <div className="flex gap-4">
            <button className="btn btn-primary flex items-center">
              <FaChartBar className="mr-2" />
              Generate Report
            </button>
            <button className="btn btn-secondary flex items-center">
              <FaCalendarAlt className="mr-2" />
              Schedule Report
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Reports</h2>
          
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg transition-all hover:-translate-y-1 animate-fadeInUp"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <FaChartBar className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{report.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-1 text-purple-500" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                      <span className="badge badge-info">{report.type}</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="btn btn-success text-sm py-2 px-4">
                    <FaDownload className="mr-1" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
