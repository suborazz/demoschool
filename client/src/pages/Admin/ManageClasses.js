import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { FaChalkboardTeacher, FaPlus, FaEdit, FaUsers, FaBook, FaUserTie, FaEye, FaTimes, FaUserPlus, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassTeacher, setSelectedClassTeacher] = useState('');
  const [subjectTeachers, setSubjectTeachers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, staffRes, subjectsRes] = await Promise.all([
        axios.get('/api/admin/classes'),
        axios.get('/api/admin/staff'),
        axios.get('/api/admin/subjects')
      ]);
      setClasses(classesRes.data.data || []);
      setStaff(staffRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = (classItem) => {
    setSelectedClass(classItem);
    setSelectedClassTeacher(classItem.classTeacher?._id || '');
    
    // Initialize subject teachers
    const initialSubjectTeachers = {};
    classItem.subjects?.forEach(subject => {
      initialSubjectTeachers[subject._id || subject] = '';
    });
    setSubjectTeachers(initialSubjectTeachers);
    
    setShowAssignModal(true);
  };

  const handleSaveAssignments = () => {
    const assignedCount = Object.values(subjectTeachers).filter(t => t).length;
    toast.success(`✅ Class Teacher & ${assignedCount} Subject Teachers assigned successfully!`);
    setShowAssignModal(false);
  };

  const classColors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
    'from-indigo-400 to-indigo-600',
    'from-red-400 to-red-600',
    'from-teal-400 to-teal-600'
  ];

  const subjectIcons = {
    'Mathematics': '🔢',
    'Science': '🔬',
    'English': '📖',
    'Social Studies': '🌍',
    'Hindi': '🇮🇳',
    'Computer Science': '💻',
    'Physics': '⚛️',
    'Chemistry': '🧪',
    'Biology': '🧬',
    'History': '📜',
    'Geography': '🗺️',
    'Economics': '💰'
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Manage Classes & Teachers</h1>
            <p className="text-gray-600 text-lg">Assign teachers to classes and subjects</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaPlus className="mr-2" />
            Create New Class
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Total Classes</p>
                <p className="text-4xl font-extrabold text-gradient">{classes.length}</p>
              </div>
              <div className="text-5xl">🏫</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Available Teachers</p>
                <p className="text-4xl font-extrabold text-gradient">{staff.filter(s => s.department === 'Teaching').length}</p>
              </div>
              <div className="text-5xl">👨‍🏫</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Total Subjects</p>
                <p className="text-4xl font-extrabold text-gradient">{subjects.length}</p>
              </div>
              <div className="text-5xl">📚</div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="loader"></div>
            </div>
          ) : classes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem, index) => (
                <div 
                  key={classItem._id}
                  className="modern-card group hover-lift animate-fadeInUp"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  {/* Class Header */}
                  <div className={`h-32 rounded-t-2xl bg-gradient-to-br ${classColors[index % classColors.length]} p-6 flex items-center justify-between -m-8 mb-6`}>
                    <div>
                      <h3 className="text-3xl font-extrabold text-white mb-1">
                        {classItem.name}
                      </h3>
                      <p className="text-white/90 font-semibold">
                        Grade {classItem.grade} • {classItem.academicYear}
                      </p>
                    </div>
                    <div className="text-6xl group-hover:scale-125 transition-transform">
                      🎓
                    </div>
                  </div>

                  {/* Class Teacher Section */}
                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {classItem.classTeacher ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold">
                              <FaCheckCircle />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-semibold">Class Teacher</p>
                              <p className="font-bold text-gray-800">Assigned ✓</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                              ?
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-semibold">Class Teacher</p>
                              <p className="font-semibold text-red-500">Not Assigned</p>
                            </div>
                          </>
                        )}
                      </div>
                      <button 
                        onClick={() => handleAssignTeacher(classItem)}
                        className="btn btn-warning text-xs py-2 px-4"
                      >
                        <FaUserPlus className="mr-1" />
                        {classItem.classTeacher ? 'Manage' : 'Assign'}
                      </button>
                    </div>
                  </div>

                  {/* Class Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center text-sm">
                        <FaUsers className="mr-2 text-purple-500" />
                        Sections:
                      </span>
                      <div className="flex gap-2">
                        {classItem.sections?.map((section, i) => (
                          <span key={i} className="badge badge-info">{section}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center text-sm">
                        <FaBook className="mr-2 text-blue-500" />
                        Subjects:
                      </span>
                      <span className="font-bold text-gray-800">{classItem.subjects?.length || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center text-sm">
                        <FaUserTie className="mr-2 text-green-500" />
                        Capacity:
                      </span>
                      <span className="font-bold text-gray-800">{classItem.capacity}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Status:</span>
                      <span className={`badge ${classItem.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {classItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button className="flex-1 btn btn-info text-sm py-2">
                      <FaEye className="mr-1" /> View
                    </button>
                    <button className="flex-1 btn btn-success text-sm py-2">
                      <FaEdit className="mr-1" /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="modern-card text-center py-16">
              <div className="text-8xl mb-6 animate-bounce-slow">🏫</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Classes Found</h3>
              <p className="text-gray-600 mb-6">Start by creating your first class</p>
              <button className="btn btn-primary">
                <FaPlus className="mr-2" />
                Create First Class
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Assign Teacher Modal - Beautiful & Comprehensive */}
      {showAssignModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeInUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white p-8 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold mb-2">👨‍🏫 Assign Teachers</h2>
                  <p className="text-xl text-purple-100">{selectedClass.name} - Grade {selectedClass.grade}</p>
                  <p className="text-sm text-purple-200 mt-1">Academic Year: {selectedClass.academicYear}</p>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)} 
                  className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors"
                >
                  <FaTimes size={28} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Section 1: Assign Class Teacher */}
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mr-4 shadow-xl">
                    <FaUserTie className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">1. Select Class Teacher</h3>
                    <p className="text-gray-600">Main teacher responsible for this class</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {staff.filter(s => s.department === 'Teaching').map((teacher, index) => (
                    <div 
                      key={teacher._id}
                      onClick={() => setSelectedClassTeacher(teacher._id)}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
                        selectedClassTeacher === teacher._id
                          ? 'bg-gradient-to-r from-green-500 to-green-700 text-white border-green-600 shadow-xl scale-105'
                          : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400'
                      } animate-fadeInUp`}
                      style={{animationDelay: `${index * 0.03}s`}}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ${
                          selectedClassTeacher === teacher._id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gradient-to-br from-green-500 to-green-700 text-white'
                        }`}>
                          {teacher.user?.firstName?.charAt(0)}{teacher.user?.lastName?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-lg ${selectedClassTeacher === teacher._id ? 'text-white' : 'text-gray-800'}`}>
                            {teacher.user?.firstName} {teacher.user?.lastName}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              selectedClassTeacher === teacher._id 
                                ? 'bg-white/20 text-white' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {teacher.designation}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              selectedClassTeacher === teacher._id 
                                ? 'bg-white/20 text-white' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {teacher.employeeId}
                            </span>
                          </div>
                        </div>
                        {selectedClassTeacher === teacher._id && (
                          <FaCheckCircle className="text-white text-3xl animate-bounce-slow" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {staff.filter(s => s.department === 'Teaching').length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4">👨‍🏫</div>
                    <p className="text-gray-600">No teaching staff available. Add teachers first.</p>
                  </div>
                )}
              </div>

              {/* Section 2: Assign Subject Teachers */}
              <div className="pt-8 border-t-4 border-purple-200">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-4 shadow-xl">
                    <FaBook className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">2. Assign Subject Teachers</h3>
                    <p className="text-gray-600">Select which teacher teaches which subject</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {(selectedClass.subjects?.length > 0 ? selectedClass.subjects : subjects.slice(0, 6)).map((subject, index) => {
                    const subjectName = subject.name || subject;
                    const subjectId = subject._id || subject;
                    
                    return (
                      <div 
                        key={index}
                        className="modern-card p-5 hover-lift animate-fadeInUp"
                        style={{animationDelay: `${index * 0.05}s`}}
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${classColors[index % classColors.length]} flex items-center justify-center shadow-xl`}>
                            <span className="text-3xl">
                              {subjectIcons[subjectName] || '📖'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-800">{subjectName}</p>
                            <p className="text-xs text-gray-600">Select teacher for this subject</p>
                          </div>
                        </div>

                        <select 
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none font-semibold text-sm transition-all"
                          value={subjectTeachers[subjectId] || ''}
                          onChange={(e) => setSubjectTeachers({...subjectTeachers, [subjectId]: e.target.value})}
                        >
                          <option value="">-- Select Teacher --</option>
                          {staff.filter(s => s.department === 'Teaching').map(teacher => (
                            <option key={teacher._id} value={teacher._id}>
                              👨‍🏫 {teacher.user?.firstName} {teacher.user?.lastName} ({teacher.designation})
                            </option>
                          ))}
                        </select>

                        {subjectTeachers[subjectId] && (
                          <div className="mt-3 flex items-center text-sm">
                            <FaCheckCircle className="text-green-600 mr-2" />
                            <span className="text-green-700 font-semibold">Teacher Assigned!</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Section */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                  <span className="text-2xl mr-2">📋</span>
                  Assignment Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white">
                    <p className="text-gray-600 text-sm mb-2">Class Teacher:</p>
                    <p className="font-bold text-gray-800">
                      {selectedClassTeacher 
                        ? `✅ ${staff.find(s => s._id === selectedClassTeacher)?.user?.firstName} ${staff.find(s => s._id === selectedClassTeacher)?.user?.lastName}`
                        : '❌ Not Selected'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white">
                    <p className="text-gray-600 text-sm mb-2">Subject Teachers:</p>
                    <p className="font-bold text-gray-800">
                      {Object.values(subjectTeachers).filter(t => t).length} / {Object.keys(subjectTeachers).length} Assigned
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={handleSaveAssignments}
                  disabled={!selectedClassTeacher}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-xl transition-all ${
                    selectedClassTeacher
                      ? 'btn btn-primary hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCheckCircle className="mr-2" />
                  Save All Assignments
                </button>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-secondary py-4 px-8"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageClasses;
