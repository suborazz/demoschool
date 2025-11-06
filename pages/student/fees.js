import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { FaMoneyBillWave, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function StudentFees() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    if (token) {
      fetchFees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Would need separate fees API for students
      setFees([]);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <FaSpinner className="text-6xl text-yellow-600 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-yellow-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaMoneyBillWave className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Fee Status
                </h1>
                <p className="text-gray-600 font-semibold">View and pay your fees</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-900 mb-2">Fee Management</p>
            <p className="text-gray-600">Your fee status and payment options will appear here</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

