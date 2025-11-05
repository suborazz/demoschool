import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once to prevent loops
    if (hasRedirected.current) return;

    if (!loading && !user) {
      console.log('🔒 ProtectedRoute: No user, redirecting to login');
      hasRedirected.current = true;
      router.push('/login');
    } else if (!loading && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      console.log('🔒 ProtectedRoute: Wrong role, redirecting to home');
      hasRedirected.current = true;
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]); // router and allowedRoles are stable, excluding from deps

  // Reset redirect flag when user changes
  useEffect(() => {
    if (user) {
      hasRedirected.current = false;
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-gray-600 font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-2xl font-bold text-red-600 mb-4">⚠️ Access Denied</p>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

