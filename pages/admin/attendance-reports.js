import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaClipboardCheck, FaCalendarAlt, FaUsers, FaCheckCircle, 
  FaTimesCircle, FaSpinner, FaChartBar, FaFileAlt, FaFilter, 
  FaClock, FaUserCheck, FaDownload, FaEye, FaSearch
} from 'react-icons/fa';

export default function AttendanceReports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState('single'); // 'single' or 'range'
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'status', 'class'
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Validation function
  const validateDateSelection = useCallback(() => {
    const errors = {};

    if (dateRange === 'single') {
      if (!selectedDate) {
        errors.selectedDate = 'Date is required';
        setFieldErrors(errors);
        return false;
      }
    } else {
      if (!startDate) {
        errors.startDate = 'Start date is required';
      }
      if (!endDate) {
        errors.endDate = 'End date is required';
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        errors.endDate = 'End date must be after start date';
      }
      // Optional: Limit date range to prevent large queries
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (daysDiff > 90) {
          errors.endDate = 'Date range cannot exceed 90 days';
        }
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
    }

    setFieldErrors({});
    return true;
  }, [dateRange, selectedDate, startDate, endDate]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const classesData = response.data.data || [];
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  }, [token]);

  const fetchAttendanceReports = useCallback(async () => {
    // Validate before fetching
    if (!validateDateSelection()) {
      toast.error('Please fix the date selection errors');
      return;
    }

    try {
      setLoading(true);
      setHasLoadedOnce(true);
      const params = {
        classId: selectedClass !== 'all' ? selectedClass : undefined
      };

      if (dateRange === 'single') {
        params.date = selectedDate;
      } else {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get('/api/admin/attendance/reports', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setAttendanceData(response.data.data || []);
      setStats(response.data.stats || {});
      
      const recordCount = response.data.data?.length || 0;
      if (recordCount > 0) {
        toast.success(`Loaded ${recordCount} attendance record${recordCount === 1 ? '' : 's'}`);
      } else {
        toast.info('No attendance records found for the selected criteria');
      }
    } catch (error) {
      console.error('Error fetching attendance reports:', error);
      toast.error(error.response?.data?.message || 'Failed to load attendance reports');
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate, startDate, endDate, selectedClass, dateRange, validateDateSelection]);

  useEffect(() => {
    if (token) {
      fetchClasses();
    }
  }, [token, fetchClasses]);

  // Note: We don't auto-fetch to avoid unnecessary API calls
  // User must click "Load Reports" button to fetch data

  const getFilteredAndSortedData = () => {
    let data = [...attendanceData];

    // Apply status filter
    if (filterStatus !== 'all') {
      data = data.filter(record => record.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(record => {
        const studentName = `${record.student?.user?.firstName || ''} ${record.student?.user?.lastName || ''}`.toLowerCase();
        const rollNumber = record.student?.rollNumber?.toLowerCase() || '';
        const admissionNumber = record.student?.admissionNumber?.toLowerCase() || '';
        const className = record.class?.name?.toLowerCase() || '';
        
        return studentName.includes(query) || 
               rollNumber.includes(query) || 
               admissionNumber.includes(query) ||
               className.includes(query);
      });
    }

    // Apply sorting
    data.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = `${a.student?.user?.firstName || ''} ${a.student?.user?.lastName || ''}`.toLowerCase();
          const nameB = `${b.student?.user?.firstName || ''} ${b.student?.user?.lastName || ''}`.toLowerCase();
          return nameA.localeCompare(nameB);
        
        case 'status':
          const statusOrder = { 'present': 1, 'late': 2, 'half-day': 3, 'on-leave': 4, 'absent': 5 };
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        
        case 'class':
          const classA = a.class?.name || '';
          const classB = b.class?.name || '';
          return classA.localeCompare(classB);
        
        case 'roll':
          const rollA = parseInt(a.student?.rollNumber) || 0;
          const rollB = parseInt(b.student?.rollNumber) || 0;
          return rollA - rollB;
        
        default:
          return 0;
      }
    });

    return data;
  };

  const filteredData = getFilteredAndSortedData();

  // Export function
  const handleExport = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Create CSV content
      const headers = ['S.No', 'Student Name', 'Roll No', 'Admission No', 'Class', 'Status', 'Marked By', 'Remarks'];
      const csvContent = [
        headers.join(','),
        ...filteredData.map((record, index) => [
          index + 1,
          `"${record.student?.user?.firstName || ''} ${record.student?.user?.lastName || ''}"`,
          record.student?.rollNumber || '',
          record.student?.admissionNumber || '',
          `"${record.class?.name || ''}"`,
          record.status || '',
          `"${record.markedBy?.firstName || ''} ${record.markedBy?.lastName || ''}"`,
          `"${record.remarks || ''}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_report_${selectedDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const presentCount = attendanceData.filter(r => r.status === 'present').length;
  const absentCount = attendanceData.filter(r => r.status === 'absent').length;
  const lateCount = attendanceData.filter(r => r.status === 'late').length;
  const halfDayCount = attendanceData.filter(r => r.status === 'half-day').length;
  const onLeaveCount = attendanceData.filter(r => r.status === 'on-leave').length;
  const totalMarked = attendanceData.length;

  const getStatusBadge = (status) => {
    const badges = {
      'present': 'bg-green-100 text-green-700',
      'absent': 'bg-red-100 text-red-700',
      'late': 'bg-yellow-100 text-yellow-700',
      'half-day': 'bg-purple-100 text-purple-700',
      'on-leave': 'bg-blue-100 text-blue-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'present': <FaCheckCircle className="inline mr-1" />,
      'absent': <FaTimesCircle className="inline mr-1" />,
      'late': <FaClock className="inline mr-1" />,
      'half-day': <FaUserCheck className="inline mr-1" />,
      'on-leave': <FaCalendarAlt className="inline mr-1" />
    };
    return icons[status] || null;
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-indigo-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <FaClipboardCheck className="text-white text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Attendance Reports
                </h1>
                <p className="text-gray-600 text-sm sm:text-base font-semibold">
                  View and monitor student attendance records
                </p>
              </div>
            </div>

            {/* Info Notice */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-indigo-800 mb-2">
                <FaEye className="inline mr-2" />
                View-Only Access
              </p>
              <p className="text-xs text-indigo-700">
                As an admin, you can view attendance reports and statistics. 
                Attendance is marked by teachers/staff assigned to each class.
              </p>
            </div>

            {/* Date Range Toggle */}
            <div className="mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDateRange('single');
                    setFieldErrors({});
                  }}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    dateRange === 'single'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Single Date
                </button>
                <button
                  onClick={() => {
                    setDateRange('range');
                    setFieldErrors({});
                  }}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    dateRange === 'range'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Date Range
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {dateRange === 'single' ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-1 text-indigo-600" />
                    Select Date <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    fieldErrors.selectedDate 
                      ? 'bg-red-50 border-red-500' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <FaCalendarAlt className="text-indigo-600 text-xl" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        if (fieldErrors.selectedDate) {
                          setFieldErrors(prev => ({...prev, selectedDate: ''}));
                        }
                      }}
                      className="bg-transparent font-bold focus:outline-none flex-1"
                    />
                  </div>
                  {fieldErrors.selectedDate && (
                    <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors.selectedDate}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <FaCalendarAlt className="inline mr-1 text-indigo-600" />
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      fieldErrors.startDate 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <FaCalendarAlt className="text-indigo-600 text-xl" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (fieldErrors.startDate) {
                            setFieldErrors(prev => ({...prev, startDate: ''}));
                          }
                        }}
                        className="bg-transparent font-bold focus:outline-none flex-1"
                      />
                    </div>
                    {fieldErrors.startDate && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <FaCalendarAlt className="inline mr-1 text-indigo-600" />
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      fieldErrors.endDate 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <FaCalendarAlt className="text-indigo-600 text-xl" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          if (fieldErrors.endDate) {
                            setFieldErrors(prev => ({...prev, endDate: ''}));
                          }
                        }}
                        className="bg-transparent font-bold focus:outline-none flex-1"
                      />
                    </div>
                    {fieldErrors.endDate && (
                      <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.endDate}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Max 90 days range</p>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <FaChartBar className="inline mr-1 text-indigo-600" />
                  Filter by Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none font-bold"
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <FaFilter className="inline mr-1 text-indigo-600" />
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none font-bold"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Search and Sort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔍 Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, roll no, admission no, class..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔃 Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none font-bold"
                >
                  <option value="name">Student Name</option>
                  <option value="roll">Roll Number</option>
                  <option value="class">Class</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {/* Load Button */}
            <div className="mt-4">
              <button
                onClick={fetchAttendanceReports}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <FaEye />
                    <span>Load Reports</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-2xl" />
                <span className="text-2xl font-black">{presentCount}</span>
              </div>
              <p className="font-bold opacity-90 text-sm">Present</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaTimesCircle className="text-2xl" />
                <span className="text-2xl font-black">{absentCount}</span>
              </div>
              <p className="font-bold opacity-90 text-sm">Absent</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaClock className="text-2xl" />
                <span className="text-2xl font-black">{lateCount}</span>
              </div>
              <p className="font-bold opacity-90 text-sm">Late</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaUserCheck className="text-2xl" />
                <span className="text-2xl font-black">{halfDayCount}</span>
              </div>
              <p className="font-bold opacity-90 text-sm">Half Day</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaCalendarAlt className="text-2xl" />
                <span className="text-2xl font-black">{onLeaveCount}</span>
              </div>
              <p className="font-bold opacity-90 text-sm">On Leave</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaUsers className="text-2xl" />
                <span className="text-2xl font-black">{totalMarked}</span>
              </div>
              <p className="font-bold opacity-90 text-sm">Total</p>
            </div>
          </div>

          {/* Attendance Records */}
          {!hasLoadedOnce && !loading ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border-2 border-indigo-100">
              <FaSearch className="text-6xl text-indigo-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to View Reports</h3>
              <p className="text-gray-600 mb-6">
                Select your desired filters and click the <strong className="text-indigo-600">&quot;Load Reports&quot;</strong> button above to view attendance records.
              </p>
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 max-w-2xl mx-auto">
                <p className="text-sm text-indigo-800 font-semibold mb-2">📊 Quick Tips:</p>
                <ul className="text-sm text-indigo-700 text-left space-y-1">
                  <li>• Use <strong>Single Date</strong> to view one day&apos;s attendance</li>
                  <li>• Use <strong>Date Range</strong> to view multiple days (up to 90 days)</li>
                  <li>• Filter by class to see specific class records</li>
                  <li>• Use the search box to find specific students</li>
                  <li>• Export to CSV to download the report</li>
                </ul>
              </div>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaSpinner className="text-5xl text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-600">Loading attendance records...</p>
            </div>
          ) : attendanceData.length === 0 && filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border-2 border-indigo-100">
              <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Records Found</h3>
              <div className="text-gray-600 space-y-3">
                <p className="font-semibold">
                  {dateRange === 'single' 
                    ? `No attendance has been marked for ${new Date(selectedDate).toLocaleDateString()}`
                    : `No attendance has been marked for the selected date range`
                  }
                </p>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mt-4 max-w-2xl mx-auto">
                  <p className="text-sm text-yellow-800 font-semibold mb-2">💡 Possible Reasons:</p>
                  <ul className="text-sm text-yellow-700 text-left space-y-1">
                    <li>• Teachers haven&apos;t marked attendance for this date yet</li>
                    <li>• The selected date is a holiday or weekend</li>
                    <li>• No classes were held on this date</li>
                    <li>• Try selecting a different date or date range</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-indigo-600 font-semibold">
                    💼 Teachers mark attendance at: /staff/mark-attendance
                  </p>
                </div>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border-2 border-indigo-100">
              <FaFilter className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Matching Records</h3>
              <p className="text-gray-600 mb-4">
                No records match your current filters or search query.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setSearchQuery('');
                    setSelectedClass('all');
                  }}
                  className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-bold hover:bg-indigo-200 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  <FaFileAlt className="inline mr-2 text-indigo-600" />
                  Attendance Records ({filteredData.length})
                </h2>
                <button
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <FaDownload />
                  Export CSV
                </button>
              </div>

              <div className="space-y-3">
                {filteredData.map((record, index) => (
                  <div
                    key={record._id || index}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border-2 border-transparent hover:border-indigo-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg">
                            {record.student?.user?.firstName} {record.student?.user?.lastName}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-600">
                            <span>📚 {record.class?.name}</span>
                            <span>🎫 {record.student?.rollNumber}</span>
                            <span>📝 {record.student?.admissionNumber}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg font-bold text-sm ${getStatusBadge(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                        </span>
                        {record.markedBy && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Marked by:</p>
                            <p className="text-xs font-bold text-gray-700">
                              {record.markedBy?.firstName} {record.markedBy?.lastName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {record.remarks && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Remarks:</p>
                        <p className="text-sm text-gray-700 italic">{record.remarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

