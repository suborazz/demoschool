import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { FaMoneyBillWave, FaPlus, FaSearch, FaCheckCircle, FaClock, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ManageFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const { data } = await axios.get('/api/fees');
      setFees(data.data || []);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.student?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.student?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || fee.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalCollected = fees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
  const totalPending = fees.reduce((sum, fee) => sum + (fee.amountPending || 0), 0);
  const paidCount = fees.filter(f => f.status === 'paid').length;
  const pendingCount = fees.filter(f => f.status === 'pending' || f.status === 'partial').length;

  const stats = [
    { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, icon: '💰', color: 'from-green-500 to-green-700' },
    { label: 'Total Pending', value: `₹${totalPending.toLocaleString()}`, icon: '⏳', color: 'from-red-500 to-red-700' },
    { label: 'Paid Fees', value: paidCount, icon: '✅', color: 'from-blue-500 to-blue-700' },
    { label: 'Pending Fees', value: pendingCount, icon: '⚠️', color: 'from-yellow-500 to-yellow-700' }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <FaCheckCircle className="text-green-600" />;
      case 'pending': return <FaClock className="text-yellow-600" />;
      case 'overdue': return <FaExclamationTriangle className="text-red-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Fee Management</h1>
            <p className="text-gray-600 text-lg">Track payments and manage fee structure</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaPlus className="mr-2" />
            Add Fee Record
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
                  <p className="text-3xl font-extrabold text-gradient">{stat.value}</p>
                </div>
                <div className="text-5xl group-hover:scale-125 transition-transform">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collection Chart */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaChartLine className="mr-3 text-purple-600" />
              Fee Collection Overview
            </h2>
            <select className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none">
              <option>This Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
            </select>
          </div>

          {/* Progress Bars */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-semibold">Collection Rate</span>
                <span className="text-green-600 font-bold">
                  {totalCollected > 0 ? ((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000 animate-pulse-slow"
                  style={{width: `${totalCollected > 0 ? ((totalCollected / (totalCollected + totalPending)) * 100) : 0}%`}}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 font-semibold mb-1">Amount Collected</p>
                    <p className="text-3xl font-extrabold text-green-600">₹{totalCollected.toLocaleString()}</p>
                  </div>
                  <div className="text-5xl">💵</div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-700 font-semibold mb-1">Amount Pending</p>
                    <p className="text-3xl font-extrabold text-red-600">₹{totalPending.toLocaleString()}</p>
                  </div>
                  <div className="text-5xl">⏰</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="modern-card p-6 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name..."
                className="input pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-6 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none font-semibold"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Fee Records */}
        <div className="modern-card overflow-hidden animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">
              Fee Records ({filteredFees.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="loader"></div>
            </div>
          ) : filteredFees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Fee Type</th>
                    <th>Total Amount</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee, index) => (
                    <tr key={fee._id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                            {fee.student?.user?.firstName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {fee.student?.user?.firstName} {fee.student?.user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{fee.student?.admissionNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{fee.feeType}</span>
                      </td>
                      <td className="font-bold">₹{fee.totalAmount?.toLocaleString()}</td>
                      <td className="font-bold text-green-600">₹{fee.amountPaid?.toLocaleString()}</td>
                      <td className="font-bold text-red-600">₹{fee.amountPending?.toLocaleString()}</td>
                      <td className="text-gray-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(fee.status)}
                          <span className={`badge ${
                            fee.status === 'paid' ? 'badge-success' :
                            fee.status === 'overdue' ? 'badge-danger' :
                            fee.status === 'partial' ? 'badge-warning' : 'badge-info'
                          }`}>
                            {fee.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-success text-sm py-2 px-4">
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce-slow">💰</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Fee Records Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Start by creating fee records'}
              </p>
              <button className="btn btn-primary">
                <FaPlus className="mr-2" />
                Add Fee Record
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageFees;
