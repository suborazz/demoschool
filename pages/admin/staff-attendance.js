import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUserCheck, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaUsers, FaChalkboardTeacher, FaClock, FaExclamationTriangle,
  FaInfoCircle, FaCheckDouble, FaFilter, FaSearch,
  FaUserClock, FaStickyNote
} from 'react-icons/fa';

export default function StaffAttendance() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});
  const [checkInTimes, setCheckInTimes] = useState({});
  const [checkOutTimes, setCheckOutTimes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [alreadyMarkedCheck, setAlreadyMarkedCheck] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const sevenDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (token) {
      fetchStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedDate && staffMembers.length > 0) {
      checkAlreadyMarked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const staff = response.data.data || response.data.staff || [];
      setStaffMembers(staff);
      
      // Initialize attendance - default to present
      const initialAttendance = {};
      const initialRemarks = {};
      const initialCheckIn = {};
      const initialCheckOut = {};
      
      staff.forEach(member => {
        initialAttendance[member._id] = 'present';
        initialRemarks[member._id] = '';
        initialCheckIn[member._id] = '09:00';
        initialCheckOut[member._id] = '17:00';
      });
      
      setAttendance(initialAttendance);
      setRemarks(initialRemarks);
      setCheckInTimes(initialCheckIn);
      setCheckOutTimes(initialCheckOut);
      
      if (staff.length === 0) {
        toast('No staff members found', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const checkAlreadyMarked = async () => {
    if (!selectedDate) return;

    try {
      const response = await axios.get('/api/admin/staff-attendance/check', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate }
      });
      
      setAlreadyMarkedCheck(response.data.alreadyMarked || false);
      
      if (response.data.alreadyMarked) {
        setFieldErrors(prev => ({
          ...prev,
          date: `Attendance already marked for ${new Date(selectedDate).toLocaleDateString()}`
        }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.date;
          return newErrors;
        });
      }
    } catch (error) {
      // If endpoint doesn't exist, silently continue
      console.log('Check attendance endpoint not available');
    }
  };

  const handleToggle = (staffId, status) => {
    setAttendance(prev => ({ ...prev, [staffId]: status }));
  };

  const handleRemarkChange = (staffId, value) => {
    setRemarks(prev => ({ ...prev, [staffId]: value }));
  };

  const handleTimeChange = (staffId, type, value) => {
    if (type === 'checkIn') {
      setCheckInTimes(prev => ({ ...prev, [staffId]: value }));
    } else {
      setCheckOutTimes(prev => ({ ...prev, [staffId]: value }));
    }
  };

  const validateFields = useCallback(() => {
    const errors = {};
    
    // Date validation
    if (!selectedDate) {
      errors.selectedDate = 'Date is required';
    } else {
      const selected = new Date(selectedDate);
      const todayDate = new Date(today);
      const sevenDaysAgoDate = new Date(sevenDaysAgo);
      
      if (selected > todayDate) {
        errors.selectedDate = 'Cannot mark attendance for future dates';
      } else if (selected < sevenDaysAgoDate) {
        errors.selectedDate = 'Cannot mark attendance for dates older than 7 days';
      }
    }
    
    // Staff validation
    if (staffMembers.length === 0) {
      errors.staff = 'No staff members available';
    }
    
    // Check if already marked
    if (alreadyMarkedCheck) {
      errors.alreadyMarked = 'Attendance already marked for this date';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedDate, staffMembers.length, alreadyMarkedCheck, today, sevenDaysAgo]);

  const handleSubmit = () => {
    // Validate
    if (!validateFields()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    // Show confirmation
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setSubmitting(true);
    setShowConfirmation(false);

    try {
      const attendanceRecords = Object.entries(attendance).map(([staffId, status]) => ({
        staffId,
        status,
        checkInTime: checkInTimes[staffId],
        checkOutTime: status === 'present' ? checkOutTimes[staffId] : null,
        remarks: remarks[staffId] || ''
      }));

      await axios.post('/api/admin/staff-attendance', {
        date: selectedDate,
        attendanceRecords
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Staff attendance marked successfully for ${staffMembers.length} staff members!`, {
        duration: 4000,
        icon: '✅',
      });
      
      // Reset
      setFieldErrors({});
      setAlreadyMarkedCheck(true);
    } catch (error) {
      console.error('Error marking attendance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const getDepartments = useMemo(() => {
    const departments = new Set();
    staffMembers.forEach(staff => {
      if (staff.department) departments.add(staff.department);
    });
    return Array.from(departments).sort();
  }, [staffMembers]);

  const filteredStaff = useMemo(() => {
    let filtered = staffMembers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(staff => {
        const name = `${staff.user?.firstName} ${staff.user?.lastName}`.toLowerCase();
        const empId = staff.employeeId?.toLowerCase() || '';
        return name.includes(searchTerm.toLowerCase()) || empId.includes(searchTerm.toLowerCase());
      });
    }

    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(staff => staff.department === filterDepartment);
    }

    return filtered;
  }, [staffMembers, searchTerm, filterDepartment]);

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;
  const onLeaveCount = Object.values(attendance).filter(s => s === 'on_leave').length;

  const hasErrors = Object.keys(fieldErrors).length > 0;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Loading staff members...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl">
                <FaUserCheck className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black">Staff Attendance</h1>
                <p className="text-blue-100 font-semibold">Mark and manage staff attendance records</p>
              </div>
            </div>
          </div>

          {/* Required Fields Info */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Required Information</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• <strong>Date</strong> - Select the date for attendance (today or up to 7 days back)</li>
                  <li>• <strong>Attendance Status</strong> - Mark each staff member as Present, Absent, Late, or On Leave</li>
                  <li>• <strong>Check-in/Check-out Times</strong> - Required for present staff (default 9 AM - 5 PM)</li>
                  <li className="text-amber-700 italic">• Remarks are optional but helpful for absent/late staff</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Selection Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-100">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              Select Date
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Date Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Attendance Date <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  fieldErrors.selectedDate 
                    ? 'border-red-500 bg-red-50' 
                    : selectedDate 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-orange-300 bg-orange-50'
                }`}>
                  <FaCalendarAlt className={fieldErrors.selectedDate ? 'text-red-500' : 'text-blue-600'} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.selectedDate;
                        return newErrors;
                      });
                    }}
                    className="bg-transparent font-bold focus:outline-none w-full"
                    max={today}
                    min={sevenDaysAgo}
                  />
                  {fieldErrors.selectedDate && (
                    <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                  )}
                </div>
                {fieldErrors.selectedDate && (
                  <p className="text-red-600 text-sm mt-1 font-semibold">{fieldErrors.selectedDate}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Select today or up to 7 days back</p>
              </div>

              <div className="flex items-end">
                <div className="w-full">
                  <p className="text-sm font-bold text-gray-700 mb-2">Total Staff</p>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-bold text-2xl text-center">
                    {filteredStaff.length} Members
                  </div>
                </div>
              </div>
            </div>

            {/* Already Marked Warning */}
            {alreadyMarkedCheck && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3 mb-4">
                <FaTimesCircle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-bold">Attendance Already Marked</p>
                  <p className="text-red-600 text-sm mt-1">
                    Staff attendance for <strong>{new Date(selectedDate).toLocaleDateString()}</strong> has already been recorded. Please select a different date or contact system administrator.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!alreadyMarkedCheck && staffMembers.length > 0 && (
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => {
                    fetchStaff();
                    setFieldErrors({});
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || hasErrors}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheckDouble />
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Attendance can only be marked for dates within the last 7 days</li>
                  <li>• Once marked, attendance cannot be changed - contact system admin for corrections</li>
                  <li>• <strong>Present</strong>: Staff member was present full day (set check-in/check-out times)</li>
                  <li>• <strong>Late</strong>: Staff member arrived late (check-in time after 9:30 AM)</li>
                  <li>• <strong>Absent</strong>: Staff member did not attend</li>
                  <li>• <strong>On Leave</strong>: Staff member on approved leave</li>
                  <li>• Work hours are automatically calculated from check-in/check-out times</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          {staffMembers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-blue-600" />
                <h3 className="text-lg font-black">Search & Filter</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  />
                </div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all font-semibold"
                >
                  <option value="all">All Departments</option>
                  {getDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              {(searchTerm || filterDepartment !== 'all') && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredStaff.length} of {staffMembers.length} staff members
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDepartment('all');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {!alreadyMarkedCheck && staffMembers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaCheckCircle className="text-3xl" />
                  <span className="text-4xl font-black">{presentCount}</span>
                </div>
                <p className="font-bold text-lg">Present</p>
                <p className="text-green-100 text-sm">{filteredStaff.length > 0 ? ((presentCount / filteredStaff.length) * 100).toFixed(1) : 0}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaClock className="text-3xl" />
                  <span className="text-4xl font-black">{lateCount}</span>
                </div>
                <p className="font-bold text-lg">Late</p>
                <p className="text-amber-100 text-sm">{filteredStaff.length > 0 ? ((lateCount / filteredStaff.length) * 100).toFixed(1) : 0}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaTimesCircle className="text-3xl" />
                  <span className="text-4xl font-black">{absentCount}</span>
                </div>
                <p className="font-bold text-lg">Absent</p>
                <p className="text-red-100 text-sm">{filteredStaff.length > 0 ? ((absentCount / filteredStaff.length) * 100).toFixed(1) : 0}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <FaUserClock className="text-3xl" />
                  <span className="text-4xl font-black">{onLeaveCount}</span>
                </div>
                <p className="font-bold text-lg">On Leave</p>
                <p className="text-blue-100 text-sm">{filteredStaff.length > 0 ? ((onLeaveCount / filteredStaff.length) * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          )}

          {/* Staff List */}
          {staffMembers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaChalkboardTeacher className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Staff Members Found</p>
              <p className="text-gray-600">Staff members will appear here once added to the system</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No Results Found</p>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('all');
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : alreadyMarkedCheck ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaCheckDouble className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">Attendance Already Marked</p>
              <p className="text-gray-600">Select a different date to mark attendance</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <FaUsers className="text-blue-600" />
                  Staff Members ({filteredStaff.length})
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      const allPresent = {};
                      staffMembers.forEach(s => { allPresent[s._id] = 'present'; });
                      setAttendance(allPresent);
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-all flex items-center gap-2"
                  >
                    <FaCheckCircle />
                    All Present
                  </button>
                  <button
                    onClick={() => {
                      const allAbsent = {};
                      staffMembers.forEach(s => { allAbsent[s._id] = 'absent'; });
                      setAttendance(allAbsent);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all flex items-center gap-2"
                  >
                    <FaTimesCircle />
                    All Absent
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredStaff.map((staff, index) => (
                  <div
                    key={staff._id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {staff.user?.firstName} {staff.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {staff.employeeId} | {staff.designation} | {staff.department}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggle(staff._id, 'present')}
                          className={`px-5 py-2 rounded-lg font-bold transition-all ${
                            attendance[staff._id] === 'present'
                              ? 'bg-green-500 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                          }`}
                        >
                          <FaCheckCircle className="inline mr-2" />
                          Present
                        </button>
                        <button
                          onClick={() => handleToggle(staff._id, 'late')}
                          className={`px-5 py-2 rounded-lg font-bold transition-all ${
                            attendance[staff._id] === 'late'
                              ? 'bg-amber-500 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                        >
                          <FaClock className="inline mr-2" />
                          Late
                        </button>
                        <button
                          onClick={() => handleToggle(staff._id, 'absent')}
                          className={`px-5 py-2 rounded-lg font-bold transition-all ${
                            attendance[staff._id] === 'absent'
                              ? 'bg-red-500 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          <FaTimesCircle className="inline mr-2" />
                          Absent
                        </button>
                        <button
                          onClick={() => handleToggle(staff._id, 'on_leave')}
                          className={`px-5 py-2 rounded-lg font-bold transition-all ${
                            attendance[staff._id] === 'on_leave'
                              ? 'bg-blue-500 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          <FaUserClock className="inline mr-2" />
                          On Leave
                        </button>
                      </div>
                    </div>
                    
                    {/* Check-in/Check-out Times for Present Staff */}
                    {attendance[staff._id] === 'present' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <FaClock className="text-green-500" />
                            Check-in Time
                          </label>
                          <input
                            type="time"
                            value={checkInTimes[staff._id] || '09:00'}
                            onChange={(e) => handleTimeChange(staff._id, 'checkIn', e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <FaClock className="text-red-500" />
                            Check-out Time
                          </label>
                          <input
                            type="time"
                            value={checkOutTimes[staff._id] || '17:00'}
                            onChange={(e) => handleTimeChange(staff._id, 'checkOut', e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all font-bold"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Remarks Section */}
                    {(attendance[staff._id] === 'absent' || attendance[staff._id] === 'late' || attendance[staff._id] === 'on_leave') && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FaStickyNote className="text-gray-500" />
                          Remarks (Optional)
                        </label>
                        <input
                          type="text"
                          value={remarks[staff._id] || ''}
                          onChange={(e) => handleRemarkChange(staff._id, e.target.value)}
                          placeholder={`Reason for ${attendance[staff._id].replace('_', ' ')}...`}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {remarks[staff._id]?.length || 0}/200 characters
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scaleIn">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckDouble className="text-blue-600 text-3xl" />
              </div>
              
              <h3 className="text-2xl font-black text-center mb-4">Confirm Staff Attendance</h3>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Date:</span>
                  <span className="font-bold">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Total Staff:</span>
                  <span className="font-bold">{staffMembers.length}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-green-600">
                    <span className="font-semibold">Present:</span>
                    <span className="font-bold">{presentCount}</span>
                  </div>
                  <div className="flex justify-between text-amber-600">
                    <span className="font-semibold">Late:</span>
                    <span className="font-bold">{lateCount}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span className="font-semibold">Absent:</span>
                    <span className="font-bold">{absentCount}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span className="font-semibold">On Leave:</span>
                    <span className="font-bold">{onLeaveCount}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to save this attendance? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

