import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaFileAlt, FaSpinner, FaSearch, FaUserGraduate, FaTimes, 
  FaChartLine, FaCalendarCheck, FaTrophy, FaBook, FaPrint,
  FaDownload, FaCheckCircle, FaTimesCircle, FaClock
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

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Get staff's classes first
      const dashboardRes = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get students from your assigned classes
      const studentsRes = await axios.get('/api/staff/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudents(studentsRes.data.students || studentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async (studentId) => {
    try {
      setLoadingReport(true);
      const response = await axios.get(`/api/staff/student-report?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load student report');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleViewReport = (student) => {
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
  };

  const handleDownload = () => {
    toast.success('Download feature coming soon!');
  };

  const filteredStudents = students.filter(student => {
    const name = `${student.user?.firstName} ${student.user?.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'half_day': return 'text-orange-600 bg-orange-100';
      case 'on_leave': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600 bg-green-100';
    if (grade === 'B+' || grade === 'B') return 'text-blue-600 bg-blue-100';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-pink-600 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-pink-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaFileAlt className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Student Reports
                </h1>
                <p className="text-gray-600 font-semibold">View and generate student performance reports</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 focus:outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <FaTimes className="text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          </div>

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Students Found</p>
              <p className="text-gray-600">Students will appear here once they are assigned to your classes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map(student => (
                <div key={student._id} className="bg-white rounded-2xl shadow-xl p-6 border-2 border-pink-100 hover:border-pink-300 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                      <FaUserGraduate className="text-pink-600 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">{student.user?.firstName} {student.user?.lastName}</h3>
                      <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Class:</span>
                      <span className="font-bold">{student.class?.name || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Roll No:</span>
                      <span className="font-bold">{student.rollNumber || 'N/A'}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleViewReport(student)}
                    disabled={loadingReport}
                    className="w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-2 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loadingReport && selectedStudent?._id === student._id ? (
                      <FaSpinner className="inline animate-spin mr-2" />
                    ) : (
                      <FaFileAlt className="inline mr-2" />
                    )}
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Report Modal */}
          {showModal && reportData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black">{reportData.student.name}</h2>
                    <p className="text-sm opacity-90">
                      {reportData.student.admissionNumber} | {reportData.student.class?.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrint}
                      className="bg-white text-pink-600 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition-all flex items-center gap-2"
                    >
                      <FaPrint /> Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-white text-pink-600 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition-all flex items-center gap-2"
                    >
                      <FaDownload /> Export
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="bg-white text-pink-600 p-2 rounded-lg hover:bg-pink-50 transition-all"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Student Info */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-4">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-bold">{reportData.student.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Roll Number:</span>
                        <p className="font-bold">{reportData.student.rollNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <p className="font-bold">{reportData.student.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Blood Group:</span>
                        <p className="font-bold">{reportData.student.bloodGroup || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Class:</span>
                        <p className="font-bold">
                          {reportData.student.class?.name} - Grade {reportData.student.class?.grade} {reportData.student.class?.section}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Academic Year:</span>
                        <p className="font-bold">{reportData.academicYear}</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                      <FaTrophy className="text-3xl text-blue-600 mb-2" />
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-3xl font-black text-blue-600">{reportData.gradeStats.averagePercentage}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                      <FaCalendarCheck className="text-3xl text-green-600 mb-2" />
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="text-3xl font-black text-green-600">{reportData.attendanceStats.attendancePercentage}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                      <FaBook className="text-3xl text-purple-600 mb-2" />
                      <p className="text-sm text-gray-600">Total Exams</p>
                      <p className="text-3xl font-black text-purple-600">{reportData.gradeStats.totalExams}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                      <FaChartLine className="text-3xl text-yellow-600 mb-2" />
                      <p className="text-sm text-gray-600">Pass Rate</p>
                      <p className="text-3xl font-black text-yellow-600">
                        {reportData.gradeStats.totalExams > 0 
                          ? ((reportData.gradeStats.totalPassed / reportData.gradeStats.totalExams) * 100).toFixed(0)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Subject-wise Performance */}
                  {Object.keys(reportData.gradeStats.subjectWisePerformance).length > 0 && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                      <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                        <FaBook className="text-purple-600" />
                        Subject-wise Performance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(reportData.gradeStats.subjectWisePerformance).map(([subject, perf]) => (
                          <div key={subject} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2">{subject}</h4>
                            <div className="space-y-1 text-sm">
                              <p className="flex justify-between">
                                <span className="text-gray-600">Average:</span>
                                <span className="font-bold">{perf.averagePercentage}%</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-gray-600">Exams:</span>
                                <span className="font-bold">{perf.examCount}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-gray-600">Grades:</span>
                                <span className="font-bold">{perf.grades.join(', ')}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grades Table */}
                  {reportData.grades.length > 0 && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                        <h3 className="text-xl font-black flex items-center gap-2">
                          <FaTrophy />
                          Examination Results
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Subject</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Exam Type</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Marks</th>
                              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Percentage</th>
                              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Grade</th>
                              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {reportData.grades.map((grade, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-semibold">{grade.subject}</td>
                                <td className="px-4 py-3 text-sm">{grade.examType}</td>
                                <td className="px-4 py-3 text-sm">{new Date(grade.examDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-sm text-center">
                                  {grade.marksObtained}/{grade.totalMarks}
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-bold">{grade.percentage}%</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(grade.grade)}`}>
                                    {grade.grade}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {grade.isPassed ? (
                                    <FaCheckCircle className="text-green-600 inline text-lg" />
                                  ) : (
                                    <FaTimesCircle className="text-red-600 inline text-lg" />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Attendance Summary */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <FaCalendarCheck className="text-green-600" />
                      Attendance Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-black text-gray-900">{reportData.attendanceStats.totalDays}</p>
                        <p className="text-xs text-gray-600">Total Days</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-green-600">{reportData.attendanceStats.present}</p>
                        <p className="text-xs text-gray-600">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-red-600">{reportData.attendanceStats.absent}</p>
                        <p className="text-xs text-gray-600">Absent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-yellow-600">{reportData.attendanceStats.late}</p>
                        <p className="text-xs text-gray-600">Late</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-orange-600">{reportData.attendanceStats.halfDay}</p>
                        <p className="text-xs text-gray-600">Half Day</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-blue-600">{reportData.attendanceStats.onLeave}</p>
                        <p className="text-xs text-gray-600">On Leave</p>
                      </div>
                    </div>

                    {/* Recent Attendance */}
                    {reportData.attendanceRecords.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">Recent Attendance (Last 30 Days)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                          {reportData.attendanceRecords.map((record, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
                              <span className="text-xs text-gray-600">
                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                          ))}
                        </div>
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

