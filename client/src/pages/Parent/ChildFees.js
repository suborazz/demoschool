import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { FaMoneyBillWave, FaCreditCard, FaCheckCircle, FaClock, FaExclamationTriangle, FaDownload, FaHistory, FaRupeeSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ChildFees = () => {
  const { childId } = useParams();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const stats = [
    { label: 'Total Fees', value: '₹50,000', icon: '💰', color: 'from-blue-500 to-blue-700' },
    { label: 'Amount Paid', value: '₹35,000', icon: '✅', color: 'from-green-500 to-green-700' },
    { label: 'Balance', value: '₹15,000', icon: '⏳', color: 'from-red-500 to-red-700' },
    { label: 'Next Due', value: 'Nov 15', icon: '📅', color: 'from-purple-500 to-purple-700' }
  ];

  const feeRecords = [
    { 
      id: 1, 
      type: 'Tuition Fee', 
      total: 20000, 
      paid: 20000, 
      pending: 0, 
      dueDate: '2024-10-15', 
      status: 'paid',
      term: 'Term 1'
    },
    { 
      id: 2, 
      type: 'Exam Fee', 
      total: 5000, 
      paid: 5000, 
      pending: 0, 
      dueDate: '2024-10-20', 
      status: 'paid',
      term: 'Term 1'
    },
    { 
      id: 3, 
      type: 'Library Fee', 
      total: 2000, 
      paid: 2000, 
      pending: 0, 
      dueDate: '2024-09-30', 
      status: 'paid',
      term: 'Annual'
    },
    { 
      id: 4, 
      type: 'Tuition Fee', 
      total: 20000, 
      paid: 8000, 
      pending: 12000, 
      dueDate: '2024-11-15', 
      status: 'partial',
      term: 'Term 2'
    },
    { 
      id: 5, 
      type: 'Sports Fee', 
      total: 3000, 
      paid: 0, 
      pending: 3000, 
      dueDate: '2024-11-20', 
      status: 'pending',
      term: 'Term 2'
    }
  ];

  const paymentHistory = [
    { date: '2024-10-15', amount: 20000, method: 'UPI', receipt: 'REC001', type: 'Tuition Fee' },
    { date: '2024-10-20', amount: 5000, method: 'Card', receipt: 'REC002', type: 'Exam Fee' },
    { date: '2024-10-28', amount: 8000, method: 'Net Banking', receipt: 'REC003', type: 'Tuition Fee' },
    { date: '2024-09-30', amount: 2000, method: 'UPI', receipt: 'REC004', type: 'Library Fee' }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <FaCheckCircle className="text-2xl text-green-600" />;
      case 'pending': return <FaClock className="text-2xl text-yellow-600" />;
      case 'partial': return <FaExclamationTriangle className="text-2xl text-orange-600" />;
      case 'overdue': return <FaExclamationTriangle className="text-2xl text-red-600" />;
      default: return null;
    }
  };

  const handlePayNow = (fee) => {
    setSelectedFee(fee);
    setShowPaymentModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Fee Management</h1>
            <p className="text-gray-600 text-lg">Manage your child's fee payments</p>
          </div>
          <button className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl">
            <FaDownload className="mr-2" />
            Download All Receipts
          </button>
        </div>

        {/* Child Info */}
        <div className="modern-card p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-fadeIn">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl text-5xl">
              👧
            </div>
            <div>
              <h2 className="text-3xl font-extrabold mb-2">Sarah Student</h2>
              <p className="text-xl text-purple-100">Class 10-A • Academic Year 2024-2025</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn" style={{animationDelay: '0.1s'}}>
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

        {/* Fee Payment Progress */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaRupeeSign className="mr-3 text-green-600" />
            Fee Payment Progress
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-semibold">Overall Payment</span>
                <span className="text-green-600 font-bold text-xl">70% Completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-6 rounded-full transition-all duration-1000 animate-pulse-slow flex items-center justify-end pr-4" style={{width: '70%'}}>
                  <span className="text-white text-xs font-bold">₹35,000 / ₹50,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Records */}
        <div className="modern-card overflow-hidden animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Fee Details ({feeRecords.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Term</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feeRecords.map((fee, index) => (
                  <tr key={fee.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg">
                          <FaMoneyBillWave className="text-white" />
                        </div>
                        <span className="font-bold text-gray-800">{fee.type}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{fee.term}</span>
                    </td>
                    <td className="font-bold text-gray-800 text-lg">₹{fee.total.toLocaleString()}</td>
                    <td className="font-bold text-green-600 text-lg">₹{fee.paid.toLocaleString()}</td>
                    <td className="font-bold text-red-600 text-lg">₹{fee.pending.toLocaleString()}</td>
                    <td className="text-gray-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(fee.status)}
                        <span className={`badge ${
                          fee.status === 'paid' ? 'badge-success' :
                          fee.status === 'partial' ? 'badge-warning' :
                          fee.status === 'overdue' ? 'badge-danger' : 'badge-info'
                        }`}>
                          {fee.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      {fee.pending > 0 ? (
                        <button 
                          onClick={() => handlePayNow(fee)}
                          className="btn btn-primary text-sm py-2 px-4"
                        >
                          <FaCreditCard className="mr-1" /> Pay Now
                        </button>
                      ) : (
                        <button className="btn btn-success text-sm py-2 px-4">
                          <FaDownload className="mr-1" /> Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="modern-card p-8 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaHistory className="mr-3 text-purple-600" />
            Payment History
          </h2>
          
          <div className="space-y-3">
            {paymentHistory.map((payment, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 hover:shadow-lg transition-all animate-fadeInUp"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg">
                    <FaCheckCircle className="text-white text-2xl" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{payment.type}</p>
                    <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()} • {payment.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-green-600">₹{payment.amount.toLocaleString()}</p>
                  <button className="text-xs text-purple-600 hover:text-purple-800 font-semibold mt-1">
                    <FaDownload className="inline mr-1" /> {payment.receipt}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-fadeInUp">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <FaCreditCard className="text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold">Pay Fee Online</h2>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-8">
              {/* Fee Summary */}
              <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">{selectedFee.type}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Total Amount:</span>
                    <span className="font-bold">₹{selectedFee.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Already Paid:</span>
                    <span className="font-bold">₹{selectedFee.paid.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-gray-300 my-2"></div>
                  <div className="flex justify-between text-red-600 text-lg">
                    <span className="font-bold">Amount to Pay:</span>
                    <span className="font-extrabold">₹{selectedFee.pending.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <label className="label">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'UPI', icon: '📱', color: 'from-blue-400 to-blue-600' },
                    { name: 'Card', icon: '💳', color: 'from-purple-400 to-purple-600' },
                    { name: 'Net Banking', icon: '🏦', color: 'from-green-400 to-green-600' }
                  ].map((method, i) => (
                    <button
                      key={i}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all hover:scale-105 hover:shadow-lg"
                    >
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <p className="text-xs font-semibold text-gray-700">{method.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    toast.success('Redirecting to payment gateway...');
                    setTimeout(() => {
                      toast.success('Payment successful! ✅');
                      setShowPaymentModal(false);
                    }, 2000);
                  }}
                  className="flex-1 btn btn-primary py-4 text-lg flex items-center justify-center"
                >
                  <FaCreditCard className="mr-2" />
                  Pay ₹{selectedFee.pending.toLocaleString()}
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="btn btn-secondary py-4 px-6">
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

export default ChildFees;
