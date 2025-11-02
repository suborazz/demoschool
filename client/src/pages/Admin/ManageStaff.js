import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { FaUserTie, FaPlus, FaEdit, FaTrash, FaSearch, FaMoneyBillWave, FaCalendarCheck, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await axios.get('/api/admin/staff');
      setStaff(data.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(member =>
    member.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Staff', value: staff.length, icon: '👨‍🏫', color: 'from-green-500 to-green-700', bgColor: 'bg-green-50' },
    { label: 'Teaching Staff', value: staff.filter(s => s.department === 'Teaching').length, icon: '📚', color: 'from-blue-500 to-blue-700', bgColor: 'bg-blue-50' },
    { label: 'Administrative', value: staff.filter(s => s.department === 'Administrative').length, icon: '💼', color: 'from-purple-500 to-purple-700', bgColor: 'bg-purple-50' },
    { label: 'Active Staff', value: staff.filter(s => s.status === 'active').length, icon: '✅', color: 'from-pink-500 to-pink-700', bgColor: 'bg-pink-50' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Manage Staff</h1>
            <p className="text-gray-600 text-lg">Manage faculty and staff members</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaPlus className="mr-2" />
            Add New Staff
          </button>
        </div>

        {/* Stats Grid */}
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
                <div className="text-5xl group-hover:scale-125 transition-transform">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="modern-card p-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff by name or employee ID..."
              className="input pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Staff Grid */}
        <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="loader"></div>
            </div>
          ) : filteredStaff.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((member, index) => (
                <div 
                  key={member._id}
                  className="modern-card group hover-lift animate-fadeInUp"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  {/* Header with Avatar */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                      {member.user?.firstName?.charAt(0)}{member.user?.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">
                        {member.user?.firstName} {member.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{member.designation}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="font-mono font-semibold text-purple-600">{member.employeeId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Department:</span>
                      <span className="badge badge-info">{member.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Salary:</span>
                      <span className="font-bold text-green-600">₹{member.salary?.basicSalary?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
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
              <div className="text-8xl mb-6 animate-bounce-slow">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Staff Members Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first staff member'}
              </p>
              <button className="btn btn-primary">
                <FaPlus className="mr-2" />
                Add First Staff Member
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageStaff;
