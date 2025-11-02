import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';

// Scroll to top on route change
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Admission from './pages/Public/Admission';
import Gallery from './pages/Public/Gallery';
import Contact from './pages/Public/Contact';
import Privacy from './pages/Public/Privacy';
import Terms from './pages/Public/Terms';
import Sitemap from './pages/Public/Sitemap';
import Login from './pages/Auth/Login';

// Protected Routes
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import ManageStudents from './pages/Admin/ManageStudents';
import ManageStaff from './pages/Admin/ManageStaff';
import ManageClasses from './pages/Admin/ManageClasses';
import ManageFees from './pages/Admin/ManageFees';
import Reports from './pages/Admin/Reports';

// Staff Pages
import StaffDashboard from './pages/Staff/Dashboard';
import MarkAttendance from './pages/Staff/MarkAttendance';
import ManageGrades from './pages/Staff/ManageGrades';
import LMSManagement from './pages/Staff/LMSManagement';

// Parent Pages
import ParentDashboard from './pages/Parent/Dashboard';
import ChildAttendance from './pages/Parent/ChildAttendance';
import ChildGrades from './pages/Parent/ChildGrades';
import ChildFees from './pages/Parent/ChildFees';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import StudentAttendance from './pages/Student/Attendance';
import StudentGrades from './pages/Student/Grades';
import StudentLMS from './pages/Student/LMS';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageFees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/attendance"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <MarkAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/grades"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <ManageGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/lms"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <LMSManagement />
              </ProtectedRoute>
            }
          />

          {/* Parent Routes */}
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/attendance/:childId"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ChildAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/grades/:childId"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ChildGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/fees/:childId"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ChildFees />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/grades"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/lms"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLMS />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
