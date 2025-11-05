import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ClearSession() {
  const router = useRouter();
  const [status, setStatus] = useState('Clearing session...');

  useEffect(() => {
    console.log('🧹 Clearing all session data...');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('✅ All session data cleared');
    setStatus('Session cleared! Redirecting to login...');
    
    // Redirect after 1.5 seconds
    setTimeout(() => {
      console.log('🔄 Redirecting to login...');
      window.location.href = '/login';
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-5xl">🔄</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">{status}</h1>
        <div className="flex justify-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 mt-6">Please wait...</p>
      </div>
    </div>
  );
}


