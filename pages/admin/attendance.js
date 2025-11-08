import { useRouter } from 'next/router';
import { useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  FaClipboardCheck, FaEye, FaUserTie, FaInfoCircle, FaChartLine,
  FaArrowRight, FaShieldAlt
} from 'react-icons/fa';
import Link from 'next/link';

export default function AttendanceRedirect() {
  const router = useRouter();

  // Auto redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/admin/attendance-reports');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-3xl w-full">
            {/* Info Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border-4 border-indigo-200">
              {/* Icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-5xl text-indigo-600" />
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-black text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Admin Access Information
              </h1>

              {/* Info Message */}
              <div className="bg-indigo-50 border-2 border-indigo-300 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <FaInfoCircle className="text-3xl text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold text-indigo-900 mb-3">
                      Attendance Marking Restricted
                    </h2>
                    <p className="text-indigo-800 mb-3 leading-relaxed">
                      As an <strong>Administrator</strong>, you have <strong>view-only</strong> access to attendance records. 
                      You cannot mark attendance directly.
                    </p>
                    <p className="text-indigo-700 text-sm">
                      This is a security measure to ensure accountability and proper record-keeping.
                    </p>
                  </div>
                </div>
              </div>

              {/* Roles Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaUserTie className="text-white text-xl" />
                    </div>
                    <h3 className="font-bold text-blue-900">Staff/Teachers</h3>
                  </div>
                  <p className="text-sm text-blue-800">
                    ✓ Mark attendance for their assigned classes<br />
                    ✓ Add remarks and status updates<br />
                    ✓ Full attendance management
                  </p>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <FaEye className="text-white text-xl" />
                    </div>
                    <h3 className="font-bold text-purple-900">Admin (You)</h3>
                  </div>
                  <p className="text-sm text-purple-800">
                    ✓ View all attendance records<br />
                    ✓ Generate reports and analytics<br />
                    ✓ Monitor overall attendance trends
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/admin/attendance-reports">
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-3 text-lg">
                    <FaChartLine className="text-2xl" />
                    <span>View Attendance Reports</span>
                    <FaArrowRight />
                  </button>
                </Link>

                <p className="text-center text-sm text-gray-500">
                  Redirecting automatically in 3 seconds...
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Need to make changes?</strong> Contact the respective class teachers or staff members 
                  to mark or modify attendance records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
