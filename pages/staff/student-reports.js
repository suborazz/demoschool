import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaFileAlt, FaSpinner, FaSearch, FaUserGraduate, FaTimes, 
  FaChartLine, FaCalendarCheck, FaTrophy, FaBook, FaPrint,
  FaDownload, FaCheckCircle, FaTimesCircle, FaClock, FaFilter,
  FaExclamationTriangle, FaInfoCircle, FaStar, FaAward
} from 'react-icons/fa';

export default function StudentReports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [filterClass, setFilterClass] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get students from assigned classes
      const studentsRes = await axios.get('/api/staff/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!studentsRes.data.success) {
        throw new Error(studentsRes.data.message || 'Failed to fetch students');
      }
      
      setStudents(studentsRes.data.students || studentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load students');
      toast.error('Failed to load students. Please try again.', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async (studentId) => {
    if (!studentId) {
      toast.error('Invalid student ID');
      return;
    }

    try {
      setLoadingReport(true);
      const response = await axios.get(`/api/staff/student-report?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch report');
      }
      
      setReportData(response.data.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load student report';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoadingReport(false);
    }
  };

  const handleViewReport = (student) => {
    if (!student || !student._id) {
      toast.error('Invalid student data');
      return;
    }
    setSelectedStudent(student);
    fetchStudentReport(student._id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setReportData(null);
  };

  const handlePrint = () => {
    window.print();
    toast.success('Preparing print preview...');
  };

  const handleDownload = () => {
    if (!reportData) return;
    
    try {
      // Create CSV content
      let csvContent = 'Student Report\n\n';
      csvContent += `Name:,${reportData.student.name}\n`;
      csvContent += `Admission Number:,${reportData.student.admissionNumber}\n`;
      csvContent += `Class:,${reportData.student.class?.name}\n`;
      csvContent += `Academic Year:,${reportData.academicYear}\n\n`;
      
      csvContent += 'Performance Summary\n';
      csvContent += `Average Score:,${reportData.gradeStats.averagePercentage}%\n`;
      csvContent += `Attendance:,${reportData.attendanceStats.attendancePercentage}%\n`;
      csvContent += `Total Exams:,${reportData.gradeStats.totalExams}\n`;
      csvContent += `Passed:,${reportData.gradeStats.totalPassed}\n`;
      csvContent += `Failed:,${reportData.gradeStats.totalFailed}\n\n`;
      
      csvContent += 'Examination Results\n';
      csvContent += 'Subject,Exam Type,Date,Marks Obtained,Total Marks,Percentage,Grade,Status\n';
      reportData.grades.forEach(grade => {
        csvContent += `${grade.subject},${grade.examType},${new Date(grade.examDate).toLocaleDateString()},${grade.marksObtained},${grade.totalMarks},${grade.percentage}%,${grade.grade},${grade.isPassed ? 'Pass' : 'Fail'}\n`;
      });
      
      csvContent += '\nAttendance Summary\n';
      csvContent += `Total Days:,${reportData.attendanceStats.totalDays}\n`;
      csvContent += `Present:,${reportData.attendanceStats.present}\n`;
      csvContent += `Absent:,${reportData.attendanceStats.absent}\n`;
      csvContent += `Late:,${reportData.attendanceStats.late}\n`;
      csvContent += `Half Day:,${reportData.attendanceStats.halfDay}\n`;
      csvContent += `On Leave:,${reportData.attendanceStats.onLeave}\n`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportData.student.admissionNumber}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const getUniqueClasses = useMemo(() => {
    const classes = new Set();
    students.forEach(student => {
      if (student.class?.name) {
        classes.add(student.class.name);
      }
    });
    return Array.from(classes).sort();
  }, [students]);

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student => {
        const name = `${student.user?.firstName} ${student.user?.lastName}`.toLowerCase();
        const admission = student.admissionNumber?.toLowerCase() || '';
        const roll = student.rollNumber?.toString().toLowerCase() || '';
        return name.includes(searchTerm.toLowerCase()) || 
               admission.includes(searchTerm.toLowerCase()) ||
               roll.includes(searchTerm.toLowerCase());
      });
    }

    // Filter by class
    if (filterClass !== 'all') {
      filtered = filtered.filter(student => student.class?.name === filterClass);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.user?.firstName} ${a.user?.lastName}`.localeCompare(`${b.user?.firstName} ${b.user?.lastName}`);
        case 'admission':
          return (a.admissionNumber || '').localeCompare(b.admissionNumber || '');
        case 'roll':
          return (a.rollNumber || 0) - (b.rollNumber || 0);
        case 'class':
          return (a.class?.name || '').localeCompare(b.class?.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, searchTerm, filterClass, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100 border-green-300';
      case 'absent': return 'text-red-600 bg-red-100 border-red-300';
      case 'late': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'half_day': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'on_leave': return 'text-blue-600 bg-blue-100 border-blue-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600 bg-green-100 border-green-300';
    if (grade === 'B+' || grade === 'B') return 'text-blue-600 bg-blue-100 border-blue-300';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    if (grade === 'D' || grade === 'E') return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-pink-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading students...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
              <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Students</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchStudents}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl">
                <FaFileAlt className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black">Student Reports</h1>
                <p className="text-pink-100 font-semibold">View and generate comprehensive student performance reports</p>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">About Student Reports</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• View comprehensive reports for students in your assigned classes</li>
                  <li>• Reports include grades, attendance, and performance statistics</li>
                  <li>• Use filters to find specific students or classes quickly</li>
                  <li>• Print or export reports for offline reference</li>
                  <li>• All data is for the current academic year</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaUserGraduate className="text-3xl" />
                <span className="text-4xl font-black">{students.length}</span>
              </div>
              <p className="font-bold text-lg">Total Students</p>
              <p className="text-blue-100 text-sm">In your classes</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaChartLine className="text-3xl" />
                <span className="text-4xl font-black">{getUniqueClasses.length}</span>
              </div>
              <p className="font-bold text-lg">Classes</p>
              <p className="text-purple-100 text-sm">Assigned to you</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaFilter className="text-3xl" />
                <span className="text-4xl font-black">{filteredAndSortedStudents.length}</span>
              </div>
              <p className="font-bold text-lg">Filtered Results</p>
              <p className="text-green-100 text-sm">Current view</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <FaSearch className="text-pink-600" />
              Search & Filter
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, admission, or roll number..."
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 focus:outline-none transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <FaTimes className="text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>

              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 focus:outline-none transition-all font-semibold"
              >
                <option value="all">All Classes</option>
                {getUniqueClasses.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 focus:outline-none transition-all font-semibold"
              >
                <option value="name">Sort by Name</option>
                <option value="admission">Sort by Admission No.</option>
                <option value="roll">Sort by Roll Number</option>
                <option value="class">Sort by Class</option>
              </select>
            </div>

            {(searchTerm || filterClass !== 'all') && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredAndSortedStudents.length} of {students.length} students
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterClass('all');
                  }}
                  className="text-sm text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Students List */}
          {filteredAndSortedStudents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600 mb-6">
                {students.length === 0
                  ? 'Students will appear here once they are assigned to your classes'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {(searchTerm || filterClass !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterClass('all');
                  }}
                  className="text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedStudents.map(student => (
                <div 
                  key={student._id} 
                  className="bg-white rounded-2xl shadow-xl p-6 border-2 border-pink-100 hover:border-pink-300 hover:shadow-2xl transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaUserGraduate className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 text-lg">
                        {student.user?.firstName} {student.user?.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold">{student.admissionNumber}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Class:</span>
                      <span className="font-bold text-gray-900">{student.class?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Roll No:</span>
                      <span className="font-bold text-gray-900">{student.rollNumber || 'N/A'}</span>
                    </div>
                    {student.user?.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold text-gray-700 text-xs truncate ml-2">{student.user.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleViewReport(student)}
                    disabled={loadingReport && selectedStudent?._id === student._id}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingReport && selectedStudent?._id === student._id ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Loading Report...
                      </>
                    ) : (
                      <>
                        <FaFileAlt />
                        View Report
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Report Modal */}
          {showModal && reportData && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto my-8">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10 shadow-lg">
                  <div>
                    <h2 className="text-3xl font-black">{reportData.student.name}</h2>
                    <p className="text-sm opacity-90">
                      {reportData.student.admissionNumber} | {reportData.student.class?.name} | Academic Year: {reportData.academicYear}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrint}
                      className="bg-white text-pink-600 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition-all flex items-center gap-2"
                      title="Print Report"
                    >
                      <FaPrint /> Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-white text-pink-600 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition-all flex items-center gap-2"
                      title="Export as CSV"
                    >
                      <FaDownload /> Export
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="bg-white text-pink-600 p-2 rounded-lg hover:bg-pink-50 transition-all"
                      title="Close"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Student Info */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <FaUserGraduate className="text-pink-600" />
                      Student Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-bold text-gray-900">{reportData.student.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Roll Number:</span>
                        <p className="font-bold text-gray-900">{reportData.student.rollNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <p className="font-bold text-gray-900">{reportData.student.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Blood Group:</span>
                        <p className="font-bold text-gray-900">{reportData.student.bloodGroup || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Class:</span>
                        <p className="font-bold text-gray-900">
                          {reportData.student.class?.name} - Grade {reportData.student.class?.grade} {reportData.student.class?.section}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date of Birth:</span>
                        <p className="font-bold text-gray-900">
                          {reportData.student.dateOfBirth 
                            ? new Date(reportData.student.dateOfBirth).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                      <FaTrophy className="text-4xl text-blue-600 mb-2" />
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-4xl font-black text-blue-600">{reportData.gradeStats.averagePercentage}%</p>
                      <p className="text-xs text-gray-500 mt-1">Overall performance</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                      <FaCalendarCheck className="text-4xl text-green-600 mb-2" />
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="text-4xl font-black text-green-600">{reportData.attendanceStats.attendancePercentage}%</p>
                      <p className="text-xs text-gray-500 mt-1">{reportData.attendanceStats.present} of {reportData.attendanceStats.totalDays} days</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                      <FaBook className="text-4xl text-purple-600 mb-2" />
                      <p className="text-sm text-gray-600">Total Exams</p>
                      <p className="text-4xl font-black text-purple-600">{reportData.gradeStats.totalExams}</p>
                      <p className="text-xs text-gray-500 mt-1">Completed assessments</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                      <FaAward className="text-4xl text-yellow-600 mb-2" />
                      <p className="text-sm text-gray-600">Pass Rate</p>
                      <p className="text-4xl font-black text-yellow-600">
                        {reportData.gradeStats.totalExams > 0 
                          ? ((reportData.gradeStats.totalPassed / reportData.gradeStats.totalExams) * 100).toFixed(0)
                          : 0}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {reportData.gradeStats.totalPassed} passed, {reportData.gradeStats.totalFailed} failed
                      </p>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  {reportData.gradeStats.totalExams > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Highest Score</p>
                          <FaStar className="text-green-600 text-2xl" />
                        </div>
                        <p className="text-3xl font-black text-green-600">{reportData.gradeStats.highestPercentage}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Lowest Score</p>
                          <FaExclamationTriangle className="text-orange-600 text-2xl" />
                        </div>
                        <p className="text-3xl font-black text-orange-600">{reportData.gradeStats.lowestPercentage}%</p>
                      </div>
                    </div>
                  )}

                  {/* Subject-wise Performance */}
                  {Object.keys(reportData.gradeStats.subjectWisePerformance).length > 0 && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                      <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                        <FaBook className="text-purple-600" />
                        Subject-wise Performance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(reportData.gradeStats.subjectWisePerformance).map(([subject, perf]) => (
                          <div key={subject} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200">
                            <h4 className="font-black text-gray-900 mb-3 text-lg">{subject}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Average Score:</span>
                                <span className="font-black text-purple-600 text-lg">{perf.averagePercentage}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Exams Taken:</span>
                                <span className="font-bold text-gray-900">{perf.examCount}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Grades Achieved:</span>
                                <span className="font-bold text-gray-900">{perf.grades.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grades Table */}
                  {reportData.grades.length > 0 ? (
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5">
                        <h3 className="text-xl font-black flex items-center gap-2">
                          <FaTrophy />
                          Examination Results ({reportData.grades.length} exams)
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-4 text-left text-sm font-black text-gray-700">#</th>
                              <th className="px-4 py-4 text-left text-sm font-black text-gray-700">Subject</th>
                              <th className="px-4 py-4 text-left text-sm font-black text-gray-700">Exam Type</th>
                              <th className="px-4 py-4 text-left text-sm font-black text-gray-700">Date</th>
                              <th className="px-4 py-4 text-center text-sm font-black text-gray-700">Marks</th>
                              <th className="px-4 py-4 text-center text-sm font-black text-gray-700">%</th>
                              <th className="px-4 py-4 text-center text-sm font-black text-gray-700">Grade</th>
                              <th className="px-4 py-4 text-center text-sm font-black text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {reportData.grades.map((grade, index) => (
                              <tr key={index} className="hover:bg-purple-50 transition-colors">
                                <td className="px-4 py-4 text-sm font-bold text-gray-500">{index + 1}</td>
                                <td className="px-4 py-4">
                                  <div>
                                    <p className="font-bold text-gray-900">{grade.subject}</p>
                                    {grade.subjectCode && (
                                      <p className="text-xs text-gray-500">{grade.subjectCode}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="text-sm font-semibold text-gray-700">{grade.examType}</span>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600">
                                  {new Date(grade.examDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 text-sm text-center">
                                  <span className="font-bold text-gray-900">
                                    {grade.marksObtained}/{grade.totalMarks}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="font-black text-purple-600 text-lg">{grade.percentage}%</span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`px-3 py-1 border-2 rounded-lg text-sm font-black ${getGradeColor(grade.grade)}`}>
                                    {grade.grade}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  {grade.isPassed ? (
                                    <div className="flex items-center justify-center gap-1 text-green-600">
                                      <FaCheckCircle className="text-xl" />
                                      <span className="text-sm font-bold">Pass</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1 text-red-600">
                                      <FaTimesCircle className="text-xl" />
                                      <span className="text-sm font-bold">Fail</span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                      <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-xl font-bold text-gray-900 mb-2">No Exam Results</p>
                      <p className="text-gray-600">No examination records found for this student</p>
                    </div>
                  )}

                  {/* Attendance Summary */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                      <FaCalendarCheck className="text-green-600" />
                      Attendance Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                      <div className="text-center bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <p className="text-3xl font-black text-gray-900">{reportData.attendanceStats.totalDays}</p>
                        <p className="text-xs text-gray-600 mt-1">Total Days</p>
                      </div>
                      <div className="text-center bg-green-50 rounded-lg p-4 border-2 border-green-200">
                        <p className="text-3xl font-black text-green-600">{reportData.attendanceStats.present}</p>
                        <p className="text-xs text-gray-600 mt-1">Present</p>
                      </div>
                      <div className="text-center bg-red-50 rounded-lg p-4 border-2 border-red-200">
                        <p className="text-3xl font-black text-red-600">{reportData.attendanceStats.absent}</p>
                        <p className="text-xs text-gray-600 mt-1">Absent</p>
                      </div>
                      <div className="text-center bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                        <p className="text-3xl font-black text-yellow-600">{reportData.attendanceStats.late}</p>
                        <p className="text-xs text-gray-600 mt-1">Late</p>
                      </div>
                      <div className="text-center bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                        <p className="text-3xl font-black text-orange-600">{reportData.attendanceStats.halfDay}</p>
                        <p className="text-xs text-gray-600 mt-1">Half Day</p>
                      </div>
                      <div className="text-center bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                        <p className="text-3xl font-black text-blue-600">{reportData.attendanceStats.onLeave}</p>
                        <p className="text-xs text-gray-600 mt-1">On Leave</p>
                      </div>
                    </div>

                    {/* Recent Attendance */}
                    {reportData.attendanceRecords.length > 0 ? (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <FaClock />
                          Recent Attendance (Last 30 Days)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                          {reportData.attendanceRecords.map((record, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border-2 border-gray-200 hover:border-gray-300 transition-all">
                              <span className="text-sm font-bold text-gray-600">
                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className={`text-xs px-2 py-1 border-2 rounded-full font-bold ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaClock className="text-4xl text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600">No recent attendance records</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
