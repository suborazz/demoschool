import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FaBookOpen, FaBook } from 'react-icons/fa';

export default function LMS() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-green-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaBookOpen className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Learning Materials
                </h1>
                <p className="text-gray-600 font-semibold">Access study materials and resources</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-900 mb-2">Learning Management System</p>
            <p className="text-gray-600">Study materials and resources will be available here</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

