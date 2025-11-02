import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { FaUserGraduate, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaDownload, FaEye, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/api/admin/students');
      setStudents(data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Students', value: students.length, icon: '👨‍🎓', color: 'from-blue-500 to-blue-700' },
    { label: 'Active Students', value: students.filter(s => s.status === 'active').length, icon: '✅', color: 'from-green-500 to-green-700' },
    { label: 'New This Month', value: 12, icon: '🆕', color: 'from-purple-500 to-purple-700' },
    { label: 'Total Classes', value: 10, icon: '🏫', color: 'from-pink-500 to-pink-700' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Manage Students</h1>
            <p className="text-gray-600 text-lg">Add, edit, and manage student information</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl"
          >
            <FaPlus className="mr-2" />
            Add New Student
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
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
                <div className={`text-5xl group-hover:scale-125 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="modern-card p-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or admission number..."
                className="input pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary flex items-center justify-center">
              <FaFilter className="mr-2" />
              Filters
            </button>
            <button className="btn btn-success flex items-center justify-center">
              <FaDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="modern-card overflow-hidden animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">
              Student List ({filteredStudents.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="loader"></div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Admission No.</th>
                    <th>Class</th>
                    <th>Roll No.</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student._id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {student.user?.firstName?.charAt(0)}{student.user?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {student.user?.firstName} {student.user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{student.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono font-semibold text-purple-600">{student.admissionNumber}</td>
                      <td>
                        <span className="badge badge-info">
                          {student.class?.name || 'N/A'} - {student.section}
                        </span>
                      </td>
                      <td className="font-semibold">{student.rollNumber}</td>
                      <td className="text-gray-600">{student.user?.phone}</td>
                      <td>
                        <span className={`badge ${
                          student.status === 'active' ? 'badge-success' : 
                          student.status === 'inactive' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <FaEye />
                          </button>
                          <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                            <FaEdit />
                          </button>
                          <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce-slow">🎓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Students Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first student'}
              </p>
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                <FaPlus className="mr-2" />
                Add First Student
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal - Simple Version */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeInUp">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add New Student</h2>
                <button onClick={() => setShowAddModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                  <FaTimes size={24} />
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-gray-600 text-lg">
                  Add student form coming soon...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  This will include: Personal details, Class assignment, Parent linking, Document upload
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageStudents;
