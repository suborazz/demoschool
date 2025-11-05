import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { 
  FaChartLine, FaDownload, FaPrint, FaFileAlt, FaChartBar, 
  FaChartPie, FaUsers, FaSpinner, FaMoneyBillWave, FaClipboardCheck
} from 'react-icons/fa';

export default function Reports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
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

  const reports = [
    { 
      name: 'Student Report', 
      icon: FaFileAlt, 
      gradient: 'from-blue-500 to-cyan-500', 
      count: `${reportData?.studentReport.total || 0} students`,
      details: `${reportData?.studentReport.active || 0} active`
    },
    { 
      name: 'Attendance Report', 
      icon: FaChartBar, 
      gradient: 'from-green-500 to-emerald-500', 
      count: reportData?.attendanceReport.attendanceRate || '0%',
      details: `${reportData?.attendanceReport.presentToday || 0} present today`
    },
    { 
      name: 'Fee Report', 
      icon: FaChartPie, 
      gradient: 'from-yellow-500 to-orange-500', 
      count: formatCurrency(reportData?.feeReport.collected || 0),
      details: `${formatCurrency(reportData?.feeReport.pending || 0)} pending`
    },
    { 
      name: 'Staff Report', 
      icon: FaUsers, 
      gradient: 'from-purple-500 to-pink-500', 
      count: `${reportData?.staffReport.total || 0} staff`,
      details: `${reportData?.staffReport.active || 0} active`
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
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-orange-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-600 via-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
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
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                <FaDownload />
                Export All
              </button>
              <button className="flex items-center gap-2 bg-white border-2 border-orange-300 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
                <FaPrint />
                Print
              </button>
            </div>
          </div>

          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report, index) => (
              <div key={index} className={`group bg-gradient-to-br ${report.gradient} rounded-2xl shadow-2xl p-8 text-white hover:scale-105 transition-transform cursor-pointer`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <report.icon className="text-4xl" />
                  </div>
                  <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-bold transition-all">
                    View →
                  </button>
                </div>
                <h3 className="text-2xl font-black mb-2">{report.name}</h3>
                <p className="text-2xl font-bold mb-1">{report.count}</p>
                <p className="text-sm opacity-90">{report.details}</p>
              </div>
            ))}
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-100">
              <h3 className="text-xl font-black text-blue-600 mb-4 flex items-center gap-2">
                <FaUsers />
                Student Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Total Students:</span>
                  <span className="text-2xl font-black text-blue-600">{reportData?.studentReport.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Active:</span>
                  <span className="text-lg font-bold text-green-600">{reportData?.studentReport.active || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Inactive:</span>
                  <span className="text-lg font-bold text-red-600">{reportData?.studentReport.inactive || 0}</span>
                </div>
              </div>
            </div>

            {/* Fee Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-yellow-100">
              <h3 className="text-xl font-black text-yellow-600 mb-4 flex items-center gap-2">
                <FaMoneyBillWave />
                Fee Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Collected:</span>
                  <span className="text-lg font-black text-green-600">{formatCurrency(reportData?.feeReport.collected || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Pending:</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(reportData?.feeReport.pending || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Total:</span>
                  <span className="text-2xl font-black text-blue-600">{formatCurrency(reportData?.feeReport.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-green-100">
              <h3 className="text-xl font-black text-green-600 mb-4 flex items-center gap-2">
                <FaClipboardCheck />
                Attendance Today
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Present:</span>
                  <span className="text-2xl font-black text-green-600">{reportData?.attendanceReport.presentToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Total:</span>
                  <span className="text-lg font-bold text-gray-600">{reportData?.attendanceReport.totalStudents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Rate:</span>
                  <span className="text-xl font-black text-blue-600">{reportData?.attendanceReport.attendanceRate || '0%'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
