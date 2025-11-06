import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaChartLine, FaDownload, FaPrint, FaFileAlt, FaChartBar, 
  FaChartPie, FaUsers, FaSpinner, FaMoneyBillWave, FaClipboardCheck,
  FaCalendar, FaFilter, FaTimes, FaFileExcel, FaFileCsv, FaSchool,
  FaChalkboardTeacher, FaUserGraduate, FaFileInvoiceDollar, FaCheckCircle,
  FaTimesCircle, FaSearch, FaEye, FaStar, FaClock
} from 'react-icons/fa';

export default function Reports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [detailedView, setDetailedView] = useState(null);

  useEffect(() => {
    if (token) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ dateRange });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axios.get(`/api/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const handleExportExcel = async () => {
    try {
      toast.loading('Generating Excel report...');
      const response = await axios.get('/api/admin/reports/export', {
        headers: { Authorization: `Bearer ${token}` },
        params: { format: 'excel', dateRange, startDate, endDate },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `school-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Excel report downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export Excel report');
      console.error('Export error:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      if (!reportData) return;

      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Headers
      csvContent += "School Reports Summary\n\n";
      csvContent += "Report Type,Metric,Value\n";
      
      // Student Report
      csvContent += `Student Report,Total Students,${reportData.studentReport.total}\n`;
      csvContent += `Student Report,Active Students,${reportData.studentReport.active}\n`;
      csvContent += `Student Report,Inactive Students,${reportData.studentReport.inactive}\n\n`;
      
      // Attendance Report
      csvContent += `Attendance Report,Present Today,${reportData.attendanceReport.presentToday}\n`;
      csvContent += `Attendance Report,Total Students,${reportData.attendanceReport.totalStudents}\n`;
      csvContent += `Attendance Report,Attendance Rate,${reportData.attendanceReport.attendanceRate}\n\n`;
      
      // Fee Report
      csvContent += `Fee Report,Collected,₹${reportData.feeReport.collected}\n`;
      csvContent += `Fee Report,Pending,₹${reportData.feeReport.pending}\n`;
      csvContent += `Fee Report,Total,₹${reportData.feeReport.total}\n\n`;
      
      // Staff Report
      csvContent += `Staff Report,Total Staff,${reportData.staffReport.total}\n`;
      csvContent += `Staff Report,Active Staff,${reportData.staffReport.active}\n`;
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `school-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('CSV report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export CSV report');
      console.error('Export error:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const reports = [
    { 
      id: 'students',
      name: 'Student Report', 
      icon: FaUserGraduate, 
      gradient: 'from-blue-500 to-cyan-500', 
      count: `${reportData?.studentReport.total || 0}`,
      label: 'Total Students',
      details: `${reportData?.studentReport.active || 0} active • ${reportData?.studentReport.inactive || 0} inactive`,
      color: 'blue'
    },
    { 
      id: 'attendance',
      name: 'Attendance Report', 
      icon: FaClipboardCheck, 
      gradient: 'from-green-500 to-emerald-500', 
      count: reportData?.attendanceReport.attendanceRate || '0%',
      label: 'Attendance Rate',
      details: `${reportData?.attendanceReport.presentToday || 0} present today`,
      color: 'green'
    },
    { 
      id: 'fees',
      name: 'Fee Report', 
      icon: FaMoneyBillWave, 
      gradient: 'from-yellow-500 to-orange-500', 
      count: formatCurrency(reportData?.feeReport.collected || 0),
      label: 'Fees Collected',
      details: `${formatCurrency(reportData?.feeReport.pending || 0)} pending`,
      color: 'yellow'
    },
    { 
      id: 'staff',
      name: 'Staff Report', 
      icon: FaChalkboardTeacher, 
      gradient: 'from-purple-500 to-pink-500', 
      count: `${reportData?.staffReport.total || 0}`,
      label: 'Total Staff',
      details: `${reportData?.staffReport.active || 0} active`,
      color: 'purple'
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-orange-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading reports...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-orange-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-600 via-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0">
                <FaChartLine className="text-white text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  Reports & Analytics
                </h1>
                <p className="text-gray-600 text-sm sm:text-base font-semibold">
                  View comprehensive reports and statistics
                </p>
              </div>
            </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm sm:text-base"
                >
                  <FaFilter />
                  Filters
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm sm:text-base"
                >
                  <FaFileCsv />
                  CSV
              </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-white border-2 border-orange-300 text-orange-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-orange-50 transition-all text-sm sm:text-base"
                >
                <FaPrint />
                Print
              </button>
            </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <FaCalendar className="text-orange-600" />
                    Date Range Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Quick Date Range */}
                  <div className="md:col-span-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quick Select</label>
                    <div className="flex flex-wrap gap-2">
                      {['today', 'week', 'month', 'year'].map((range) => (
                        <button
                          key={range}
                          onClick={() => {
                            setDateRange(range);
                            setStartDate('');
                            setEndDate('');
                            fetchReports();
                          }}
                          className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                            dateRange === range
                              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Date Range */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-4 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setDateRange('month');
                        fetchReports();
                      }}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={fetchReports}
                      className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {reports.map((report, index) => (
              <div 
                key={index} 
                onClick={() => setDetailedView(report.id)}
                className={`group bg-gradient-to-br ${report.gradient} rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 text-white hover:scale-105 transition-all cursor-pointer relative overflow-hidden`}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all">
                      <report.icon className="text-3xl sm:text-4xl" />
                    </div>
                    <FaEye className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-black mb-3">{report.name}</h3>
                  <p className="text-sm text-white/80 font-semibold mb-2">{report.label}</p>
                  <p className="text-3xl sm:text-4xl font-black mb-2">{report.count}</p>
                  <p className="text-sm opacity-90 font-semibold">{report.details}</p>
                  
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <button className="text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                      View Details
                      <span className="text-xl">→</span>
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Student Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-blue-200">
              <h3 className="text-lg sm:text-xl font-black text-blue-600 mb-4 flex items-center gap-2">
                <FaUserGraduate />
                Students
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-semibold text-sm">Total</span>
                  <span className="text-2xl font-black text-blue-600">{reportData?.studentReport.total || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-gray-700 font-semibold text-sm">Active</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{reportData?.studentReport.active || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-600" />
                    <span className="text-gray-700 font-semibold text-sm">Inactive</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{reportData?.studentReport.inactive || 0}</span>
                </div>
              </div>
            </div>

            {/* Fee Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-yellow-100 hover:border-yellow-300 transition-all hover:shadow-yellow-200">
              <h3 className="text-lg sm:text-xl font-black text-yellow-600 mb-4 flex items-center gap-2">
                <FaMoneyBillWave />
                Fees
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-semibold text-sm">Total</span>
                  <span className="text-lg font-black text-blue-600">{formatCurrency(reportData?.feeReport.total || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-gray-700 font-semibold text-sm">Collected</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(reportData?.feeReport.collected || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-600" />
                    <span className="text-gray-700 font-semibold text-sm">Pending</span>
                </div>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(reportData?.feeReport.pending || 0)}</span>
                </div>
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-green-200">
              <h3 className="text-lg sm:text-xl font-black text-green-600 mb-4 flex items-center gap-2">
                <FaClipboardCheck />
                Attendance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-semibold text-sm">Rate</span>
                  <span className="text-2xl font-black text-green-600">{reportData?.attendanceReport.attendanceRate || '0%'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600" />
                    <span className="text-gray-700 font-semibold text-sm">Present</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{reportData?.attendanceReport.presentToday || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-semibold text-sm">Total</span>
                  <span className="text-lg font-bold text-gray-600">{reportData?.attendanceReport.totalStudents || 0}</span>
                </div>
              </div>
            </div>

            {/* Staff Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-purple-200">
              <h3 className="text-lg sm:text-xl font-black text-purple-600 mb-4 flex items-center gap-2">
                <FaChalkboardTeacher />
                Staff
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700 font-semibold text-sm">Total</span>
                  <span className="text-2xl font-black text-purple-600">{reportData?.staffReport.total || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-gray-700 font-semibold text-sm">Active</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{reportData?.staffReport.active || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaSchool className="text-blue-600" />
                    <span className="text-gray-700 font-semibold text-sm">Classes</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{reportData?.classReport?.totalClasses || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed View Modal */}
          {detailedView && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailedView(null)}>
              <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black mb-2">Detailed {detailedView.charAt(0).toUpperCase() + detailedView.slice(1)} Report</h2>
                    <p className="text-white/90 font-semibold">Comprehensive analysis and breakdown</p>
                  </div>
                  <button
                    onClick={() => setDetailedView(null)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
                
                <div className="p-6 sm:p-8 space-y-6">
                  {detailedView === 'students' && (
                    <div className="space-y-6">
                      {/* Overview Cards */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                        <h3 className="text-xl font-black text-blue-600 mb-4 flex items-center gap-2">
                          <FaUserGraduate />
                          Student Overview
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Total Students</p>
                            <p className="text-4xl font-black text-blue-600">{reportData?.studentReport.total || 0}</p>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Active Students</p>
                            <p className="text-4xl font-black text-green-600">{reportData?.studentReport.active || 0}</p>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-600 rounded-full" 
                                style={{ width: `${reportData?.studentReport.total > 0 ? (reportData?.studentReport.active / reportData?.studentReport.total * 100) : 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-green-600 font-bold mt-1">
                              {reportData?.studentReport.total > 0 ? ((reportData?.studentReport.active / reportData?.studentReport.total) * 100).toFixed(1) : 0}% Active
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Inactive Students</p>
                            <p className="text-4xl font-black text-red-600">{reportData?.studentReport.inactive || 0}</p>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-600 rounded-full" 
                                style={{ width: `${reportData?.studentReport.total > 0 ? (reportData?.studentReport.inactive / reportData?.studentReport.total * 100) : 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-red-600 font-bold mt-1">
                              {reportData?.studentReport.total > 0 ? ((reportData?.studentReport.inactive / reportData?.studentReport.total) * 100).toFixed(1) : 0}% Inactive
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Student Distribution */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                          <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <FaChartBar className="text-blue-600" />
                            Status Distribution
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-700">Active Students</span>
                                <span className="text-sm font-black text-green-600">{reportData?.studentReport.active || 0}</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${reportData?.studentReport.total > 0 ? (reportData?.studentReport.active / reportData?.studentReport.total * 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-700">Inactive Students</span>
                                <span className="text-sm font-black text-red-600">{reportData?.studentReport.inactive || 0}</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${reportData?.studentReport.total > 0 ? (reportData?.studentReport.inactive / reportData?.studentReport.total * 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                          <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <FaCheckCircle className="text-green-600" />
                            Quick Statistics
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Total Enrollment</span>
                              <span className="text-xl font-black text-blue-600">{reportData?.studentReport.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Active Rate</span>
                              <span className="text-xl font-black text-green-600">
                                {reportData?.studentReport.total > 0 ? ((reportData?.studentReport.active / reportData?.studentReport.total) * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Classes Active</span>
                              <span className="text-xl font-black text-purple-600">{reportData?.classReport?.totalClasses || 0}</span>
                            </div>
                </div>
              </div>
            </div>

                      {/* Additional Insights */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                        <h4 className="text-lg font-black text-purple-600 mb-4 flex items-center gap-2">
                          <FaStar className="text-yellow-500" />
                          Student Insights
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <FaCheckCircle className="text-green-600 text-xl" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Retention Rate</p>
                                <p className="text-2xl font-black text-green-600">
                                  {reportData?.studentReport.total > 0 ? ((reportData?.studentReport.active / reportData?.studentReport.total) * 100).toFixed(1) : 0}%
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaSchool className="text-blue-600 text-xl" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Avg. per Class</p>
                                <p className="text-2xl font-black text-blue-600">
                                  {reportData?.classReport?.totalClasses > 0 ? (reportData?.studentReport.total / reportData?.classReport.totalClasses).toFixed(0) : 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {detailedView === 'attendance' && (
                    <div className="space-y-6">
                      {/* Attendance Overview */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
              <h3 className="text-xl font-black text-green-600 mb-4 flex items-center gap-2">
                <FaClipboardCheck />
                          Attendance Analysis
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Attendance Rate</p>
                            <p className="text-4xl font-black text-green-600">{reportData?.attendanceReport.attendanceRate || '0%'}</p>
                            <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                                style={{ width: reportData?.attendanceReport.attendanceRate || '0%' }}
                              ></div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Present Today</p>
                            <p className="text-4xl font-black text-blue-600">{reportData?.attendanceReport.presentToday || 0}</p>
                            <p className="text-xs text-blue-600 font-bold mt-2">
                              of {reportData?.attendanceReport.totalStudents || 0} students
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Absent Today</p>
                            <p className="text-4xl font-black text-red-600">
                              {(reportData?.attendanceReport.totalStudents || 0) - (reportData?.attendanceReport.presentToday || 0)}
                            </p>
                            <p className="text-xs text-red-600 font-bold mt-2">
                              {reportData?.attendanceReport.totalStudents > 0 ? 
                                (((reportData?.attendanceReport.totalStudents - reportData?.attendanceReport.presentToday) / reportData?.attendanceReport.totalStudents) * 100).toFixed(1) 
                                : 0}% Absent
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Attendance Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                          <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <FaChartBar className="text-green-600" />
                            Today&apos;s Status
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-600" />
                                  <span className="text-sm font-bold text-gray-700">Present</span>
                                </div>
                                <span className="text-sm font-black text-green-600">{reportData?.attendanceReport.presentToday || 0}</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${reportData?.attendanceReport.totalStudents > 0 ? ((reportData?.attendanceReport.presentToday / reportData?.attendanceReport.totalStudents) * 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <FaTimesCircle className="text-red-600" />
                                  <span className="text-sm font-bold text-gray-700">Absent</span>
                                </div>
                                <span className="text-sm font-black text-red-600">
                                  {(reportData?.attendanceReport.totalStudents || 0) - (reportData?.attendanceReport.presentToday || 0)}
                                </span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${reportData?.attendanceReport.totalStudents > 0 ? (((reportData?.attendanceReport.totalStudents - reportData?.attendanceReport.presentToday) / reportData?.attendanceReport.totalStudents) * 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                          <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <FaChartPie className="text-blue-600" />
                            Attendance Metrics
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Overall Rate</span>
                              <span className="text-xl font-black text-green-600">{reportData?.attendanceReport.attendanceRate || '0%'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Total Students</span>
                              <span className="text-xl font-black text-blue-600">{reportData?.attendanceReport.totalStudents || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Marked Today</span>
                              <span className="text-xl font-black text-purple-600">{reportData?.attendanceReport.presentToday || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                        <h4 className="text-lg font-black text-blue-600 mb-4 flex items-center gap-2">
                          <FaStar className="text-yellow-500" />
                          Performance Indicators
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                parseFloat(reportData?.attendanceReport.attendanceRate) >= 90 ? 'bg-green-100' :
                                parseFloat(reportData?.attendanceReport.attendanceRate) >= 75 ? 'bg-yellow-100' :
                                'bg-red-100'
                              }`}>
                                <span className="text-2xl">
                                  {parseFloat(reportData?.attendanceReport.attendanceRate) >= 90 ? '🎯' :
                                   parseFloat(reportData?.attendanceReport.attendanceRate) >= 75 ? '⚠️' : '❌'}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Status</p>
                                <p className={`text-lg font-black ${
                                  parseFloat(reportData?.attendanceReport.attendanceRate) >= 90 ? 'text-green-600' :
                                  parseFloat(reportData?.attendanceReport.attendanceRate) >= 75 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {parseFloat(reportData?.attendanceReport.attendanceRate) >= 90 ? 'Excellent' :
                                   parseFloat(reportData?.attendanceReport.attendanceRate) >= 75 ? 'Good' : 'Needs Attention'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaClock className="text-blue-600 text-xl" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Tracking</p>
                                <p className="text-lg font-black text-blue-600">Real-time</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <FaChartLine className="text-purple-600 text-xl" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Trend</p>
                                <p className="text-lg font-black text-purple-600">
                                  {parseFloat(reportData?.attendanceReport.attendanceRate) >= 75 ? '↑ Up' : '→ Stable'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {detailedView === 'fees' && (
                    <div className="space-y-6">
                      {/* Fee Overview */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-200">
                        <h3 className="text-xl font-black text-yellow-600 mb-4 flex items-center gap-2">
                          <FaMoneyBillWave />
                          Fee Collection Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Total Fees</p>
                            <p className="text-3xl font-black text-blue-600">{formatCurrency(reportData?.feeReport.total || 0)}</p>
                            <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Collected</p>
                            <p className="text-3xl font-black text-green-600">{formatCurrency(reportData?.feeReport.collected || 0)}</p>
                            <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                                style={{ width: `${reportData?.feeReport.total > 0 ? ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) : 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-green-600 font-bold mt-1">
                              {reportData?.feeReport.total > 0 ? ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100).toFixed(1) : 0}% Collected
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Pending</p>
                            <p className="text-3xl font-black text-red-600">{formatCurrency(reportData?.feeReport.pending || 0)}</p>
                            <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" 
                                style={{ width: `${reportData?.feeReport.total > 0 ? ((reportData?.feeReport.pending / reportData?.feeReport.total) * 100) : 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-red-600 font-bold mt-1">
                              {reportData?.feeReport.total > 0 ? ((reportData?.feeReport.pending / reportData?.feeReport.total) * 100).toFixed(1) : 0}% Pending
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Collection Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                          <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <FaChartBar className="text-yellow-600" />
                            Collection Status
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-600" />
                                  <span className="text-sm font-bold text-gray-700">Collected</span>
                                </div>
                                <span className="text-sm font-black text-green-600">{formatCurrency(reportData?.feeReport.collected || 0)}</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${reportData?.feeReport.total > 0 ? ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <FaTimesCircle className="text-red-600" />
                                  <span className="text-sm font-bold text-gray-700">Pending</span>
                                </div>
                                <span className="text-sm font-black text-red-600">{formatCurrency(reportData?.feeReport.pending || 0)}</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${reportData?.feeReport.total > 0 ? ((reportData?.feeReport.pending / reportData?.feeReport.total) * 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                          <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <FaFileInvoiceDollar className="text-blue-600" />
                            Financial Summary
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                              <span className="text-xl font-black text-blue-600">{formatCurrency(reportData?.feeReport.total || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Collection Rate</span>
                              <span className="text-xl font-black text-green-600">
                                {reportData?.feeReport.total > 0 ? ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Students</span>
                              <span className="text-xl font-black text-orange-600">{reportData?.studentReport.total || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="bg-gradient-to-br from-green-50 to-cyan-50 p-6 rounded-2xl border-2 border-green-200">
                        <h4 className="text-lg font-black text-green-600 mb-4 flex items-center gap-2">
                          <FaStar className="text-yellow-500" />
                          Collection Performance
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 80 ? 'bg-green-100' :
                                reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 60 ? 'bg-yellow-100' :
                                'bg-red-100'
                              }`}>
                                <span className="text-2xl">
                                  {reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 80 ? '✅' :
                                   reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 60 ? '⚠️' : '❌'}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Status</p>
                                <p className={`text-lg font-black ${
                                  reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 80 ? 'text-green-600' :
                                  reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 80 ? 'Excellent' :
                                   reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 60 ? 'Good' : 'Action Needed'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <FaUsers className="text-purple-600 text-xl" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Avg. per Student</p>
                                <p className="text-lg font-black text-purple-600">
                                  {reportData?.studentReport.total > 0 ? 
                                    formatCurrency((reportData?.feeReport.total || 0) / reportData?.studentReport.total) 
                                    : '₹0'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaChartLine className="text-blue-600 text-xl" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Trend</p>
                                <p className="text-lg font-black text-blue-600">
                                  {reportData?.feeReport.total > 0 && ((reportData?.feeReport.collected / reportData?.feeReport.total) * 100) >= 70 ? '↑ Positive' : '→ Monitor'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {detailedView === 'staff' && (
                    <div className="space-y-6">
                      {/* Staff Overview */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                        <h3 className="text-xl font-black text-purple-600 mb-4 flex items-center gap-2">
                          <FaChalkboardTeacher />
                          Staff Information
              </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Total Staff</p>
                            <p className="text-4xl font-black text-purple-600">{reportData?.staffReport.total || 0}</p>
                            <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Active Staff</p>
                            <p className="text-4xl font-black text-green-600">{reportData?.staffReport.active || 0}</p>
                            <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                                style={{ width: `${reportData?.staffReport.total > 0 ? ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) : 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-green-600 font-bold mt-1">
                              {reportData?.staffReport.total > 0 ? ((reportData?.staffReport.active / reportData?.staffReport.total) * 100).toFixed(1) : 0}% Active
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <p className="text-gray-600 font-semibold text-sm mb-2">Total Classes</p>
                            <p className="text-4xl font-black text-blue-600">{reportData?.classReport?.totalClasses || 0}</p>
                            <p className="text-xs text-blue-600 font-bold mt-2">
                              Managed by staff
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Staff Distribution */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                          <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <FaChartBar className="text-purple-600" />
                            Staff Distribution
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-600" />
                                  <span className="text-sm font-bold text-gray-700">Active Staff</span>
                                </div>
                                <span className="text-sm font-black text-green-600">{reportData?.staffReport.active || 0}</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${reportData?.staffReport.total > 0 ? ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <FaTimesCircle className="text-red-600" />
                                  <span className="text-sm font-bold text-gray-700">Inactive Staff</span>
                                </div>
                                <span className="text-sm font-black text-red-600">
                                  {(reportData?.staffReport.total || 0) - (reportData?.staffReport.active || 0)}
                                </span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${reportData?.staffReport.total > 0 ? (((reportData?.staffReport.total - reportData?.staffReport.active) / reportData?.staffReport.total) * 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                          <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <FaSchool className="text-blue-600" />
                            Workload Summary
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Total Staff</span>
                              <span className="text-xl font-black text-purple-600">{reportData?.staffReport.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Total Classes</span>
                              <span className="text-xl font-black text-blue-600">{reportData?.classReport?.totalClasses || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">Avg. Classes/Staff</span>
                              <span className="text-xl font-black text-green-600">
                                {reportData?.staffReport.active > 0 && reportData?.classReport?.totalClasses > 0 ? 
                                  (reportData?.classReport.totalClasses / reportData?.staffReport.active).toFixed(1) 
                                  : '0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Staff Performance Insights */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                        <h4 className="text-lg font-black text-blue-600 mb-4 flex items-center gap-2">
                          <FaStar className="text-yellow-500" />
                          Staff Insights
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FaCheckCircle className="text-green-600 text-xl" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Active Rate</p>
                                <p className="text-2xl font-black text-green-600">
                                  {reportData?.staffReport.total > 0 ? ((reportData?.staffReport.active / reportData?.staffReport.total) * 100).toFixed(0) : 0}%
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <FaUsers className="text-purple-600 text-xl" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Staff-Student Ratio</p>
                                <p className="text-2xl font-black text-purple-600">
                                  1:{reportData?.staffReport.total > 0 && reportData?.studentReport.total > 0 ? 
                                    Math.round(reportData?.studentReport.total / reportData?.staffReport.total) 
                                    : 0}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) >= 90 ? 'bg-green-100' :
                                reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) >= 80 ? 'bg-yellow-100' :
                                'bg-red-100'
                              }`}>
                                <span className="text-2xl">
                                  {reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) >= 90 ? '⭐' :
                                   reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) >= 80 ? '👍' : '⚠️'}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold">Status</p>
                                <p className={`text-lg font-black ${
                                  reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) >= 90 ? 'text-green-600' :
                                  reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) >= 80 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) >= 90 ? 'Excellent' :
                                   reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) >= 80 ? 'Good' : 'Review Needed'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                          <h4 className="text-lg font-black text-green-600 mb-4">Capacity Utilization</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">Staff Capacity</span>
                              <span className="text-2xl font-black text-green-600">
                                {reportData?.staffReport.total > 0 && ((reportData?.staffReport.active / reportData?.staffReport.total) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                                style={{ width: `${reportData?.staffReport.total > 0 ? ((reportData?.staffReport.active / reportData?.staffReport.total) * 100) : 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              {reportData?.staffReport.active || 0} active out of {reportData?.staffReport.total || 0} total staff members
                            </p>
                          </div>
                </div>

                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-200">
                          <h4 className="text-lg font-black text-orange-600 mb-4">Class Management</h4>
                          <div className="space-y-3">
                <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">Classes per Staff</span>
                              <span className="text-2xl font-black text-orange-600">
                                {reportData?.staffReport.active > 0 && reportData?.classReport?.totalClasses > 0 ? 
                                  (reportData?.classReport.totalClasses / reportData?.staffReport.active).toFixed(1) 
                                  : '0'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-xs text-gray-600">Total Classes:</span>
                              <span className="text-sm font-black text-blue-600">{reportData?.classReport?.totalClasses || 0}</span>
                </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                              <span className="text-xs text-gray-600">Active Staff:</span>
                              <span className="text-sm font-black text-green-600">{reportData?.staffReport.active || 0}</span>
                </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100">
                    <button
                      onClick={() => setDetailedView(null)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <FaDownload />
                      Export Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Print-friendly Summary */}
          <div className="hidden print:block bg-white p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">School Reports Summary</h1>
              <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-blue-600 mb-3">Student Statistics</h2>
                <p>Total: {reportData?.studentReport.total || 0} | Active: {reportData?.studentReport.active || 0} | Inactive: {reportData?.studentReport.inactive || 0}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-green-600 mb-3">Attendance Report</h2>
                <p>Rate: {reportData?.attendanceReport.attendanceRate || '0%'} | Present Today: {reportData?.attendanceReport.presentToday || 0} | Total: {reportData?.attendanceReport.totalStudents || 0}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-yellow-600 mb-3">Fee Collection</h2>
                <p>Collected: ₹{reportData?.feeReport.collected || 0} | Pending: ₹{reportData?.feeReport.pending || 0} | Total: ₹{reportData?.feeReport.total || 0}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-purple-600 mb-3">Staff Information</h2>
                <p>Total: {reportData?.staffReport.total || 0} | Active: {reportData?.staffReport.active || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
