import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { 
  FaEnvelope, FaLock, FaSignInAlt, FaUserShield, FaUserGraduate, 
  FaChalkboardTeacher, FaUsers, FaEye, FaEyeSlash, FaStar, FaRocket 
} from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();

  // Prevent hydration mismatch by only rendering random elements on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const roles = [
    { name: 'Admin', email: 'admin@davschool.edu.in', icon: FaUserShield, gradient: 'from-blue-500 via-blue-600 to-cyan-500', emoji: '👨‍💼' },
    { name: 'Staff', email: 'teacher@davschool.edu.in', icon: FaChalkboardTeacher, gradient: 'from-green-500 via-green-600 to-emerald-500', emoji: '👨‍🏫' },
    { name: 'Parent', email: 'parent@davschool.edu.in', icon: FaUsers, gradient: 'from-yellow-500 via-orange-500 to-red-500', emoji: '👨‍👩‍👧' },
    { name: 'Student', email: 'student@davschool.edu.in', icon: FaUserGraduate, gradient: 'from-pink-500 via-pink-600 to-rose-500', emoji: '👨‍🎓' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    const username = roleEmail.split('@')[0].replace(/[^a-z]/g, '');
    setPassword(`${username}123`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden gradient-animate">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Elements - Only render on client to prevent hydration mismatch */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden opacity-15">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header - Enhanced */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fadeInUp">
            <div className="inline-flex items-center glass-card px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full mb-6 sm:mb-8 shadow-2xl hover:scale-110 transition-transform duration-300 animate-glow">
              <FaStar className="text-yellow-300 text-lg sm:text-xl md:text-2xl mr-2 sm:mr-3 animate-bounce-slow" />
              <span className="text-white font-black text-sm sm:text-base md:text-lg">Secure Login Portal</span>
            </div>

            <div className="inline-block mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 glass-card rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <span className="text-5xl sm:text-6xl md:text-8xl animate-bounce-slow">🎓</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 neon-text px-4">Welcome Back!</h2>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-light px-4">Login to access your portal</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            {/* Login Form - Enhanced */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 hover:shadow-purple-500/50 transition-all duration-500 hover:-translate-y-2 animate-slideInLeft">
              <div className="text-center mb-6 sm:mb-8 md:mb-10">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                  Sign In
                </h3>
                <p className="text-gray-600 text-base sm:text-lg md:text-xl font-semibold">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Email Field - Enhanced */}
                <div className="group">
                  <label className="block text-xs sm:text-sm font-black text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 sm:left-4 md:left-5 top-1/2 transform -translate-y-1/2 text-purple-500 text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 sm:pl-14 md:pl-16 pr-4 sm:pr-5 py-4 sm:py-5 border-2 sm:border-3 border-gray-200 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none text-base sm:text-lg transition-all font-semibold"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field - Enhanced with Show/Hide */}
                <div className="group">
                  <label className="block text-xs sm:text-sm font-black text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 sm:left-4 md:left-5 top-1/2 transform -translate-y-1/2 text-purple-500 text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 sm:pl-14 md:pl-16 pr-14 sm:pr-16 py-4 sm:py-5 border-2 sm:border-3 border-gray-200 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none text-base sm:text-lg transition-all font-semibold"
                      placeholder="••••••••"
                      required
                    />
                    {/* Show/Hide Password Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 md:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 text-xl sm:text-2xl transition-colors p-2 hover:scale-110"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-semibold">
                    {showPassword ? '🔓 Password visible' : '🔒 Password hidden'}
                  </p>
                </div>

                {/* Submit Button - Enhanced */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg md:text-xl shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                  style={{ backgroundSize: '200% auto' }}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-b-4 border-white mr-2 sm:mr-3" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-2 sm:mr-3 md:mr-4 text-lg sm:text-xl md:text-2xl group-hover:translate-x-[-4px] transition-transform" />
                      <span className="hidden sm:inline">Sign In to Your Portal</span>
                      <span className="sm:hidden">Sign In</span>
                      <FaRocket className="ml-2 sm:ml-3 md:ml-4 text-lg sm:text-xl md:text-2xl group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm font-semibold">
                  🔐 Secure login with encrypted credentials
                </p>
              </div>
            </div>

            {/* Quick Login Options - Enhanced */}
            <div className="glass-card backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border-2 border-white/30 animate-slideInRight">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 text-center neon-text">Quick Login</h3>
              <p className="text-white text-center mb-6 sm:mb-8 md:mb-10 text-base sm:text-lg md:text-xl font-semibold">Choose a role for demo access</p>
              
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {roles.map((role, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickLogin(role.email)}
                    className="group w-full bg-white/95 hover:bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl text-left transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/50 relative overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    <div className="relative flex items-center">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 flex-shrink-0`}>
                        {role.emoji}
                      </div>
                      <div className="ml-3 sm:ml-4 md:ml-6 flex-1 min-w-0">
                        <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-1 sm:mb-2 group-hover:text-purple-600 transition-colors truncate">{role.name}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm md:text-base font-semibold truncate">{role.email}</p>
                        <p className="text-purple-600 text-xs sm:text-sm font-bold mt-1 sm:mt-2">Password: {role.email.split('@')[0].replace(/[^a-z]/g, '')}123</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        <FaRocket className="text-purple-600 text-2xl md:text-3xl" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Demo Info - Enhanced */}
              <div className="mt-6 sm:mt-8 md:mt-10 p-4 sm:p-6 md:p-8 glass-card border-2 border-white/40 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
                <div className="relative text-center">
                  <p className="text-white text-base sm:text-lg font-black mb-2 sm:mb-3">
                    🎯 Demo Credentials
                  </p>
                  <p className="text-white/90 text-sm sm:text-base font-semibold">
                    Click any role above to auto-fill credentials
                  </p>
                  <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-bold">
                      ✅ Instant Access
                    </span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-bold">
                      🔒 Secure
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info - Enhanced */}
          <div className="mt-8 sm:mt-12 md:mt-16 text-center animate-fadeInUp">
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl border-2 border-white/30 max-w-full mx-4">
              <p className="text-white text-base sm:text-lg font-bold mb-2">
                🎓 First time here?
              </p>
              <p className="text-white/90 font-semibold text-sm sm:text-base">
                Contact admin for account creation: <br className="sm:hidden" /><a href="tel:+917488770476" className="text-yellow-300 font-black hover:underline">+91 7488770476</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
