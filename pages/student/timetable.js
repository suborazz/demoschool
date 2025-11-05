import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FaClock } from 'react-icons/fa';

export default function Timetable() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-orange-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaClock className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  My Timetable
                </h1>
                <p className="text-gray-600 font-semibold">View your class schedule</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-900 mb-2">Class Timetable</p>
            <p className="text-gray-600">Your weekly schedule will appear here</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

