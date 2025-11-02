import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserShield, FaUserGraduate, FaChalkboardTeacher, FaUsers } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { name: 'Admin', email: 'admin@davschool.edu.in', icon: FaUserShield, color: 'from-blue-500 to-blue-700', emoji: '👨‍💼' },
    { name: 'Staff', email: 'teacher@davschool.edu.in', icon: FaChalkboardTeacher, color: 'from-green-500 to-green-700', emoji: '👨‍🏫' },
    { name: 'Parent', email: 'parent@davschool.edu.in', icon: FaUsers, color: 'from-yellow-500 to-yellow-700', emoji: '👨‍👩‍👧' },
    { name: 'Student', email: 'student@davschool.edu.in', icon: FaUserGraduate, color: 'from-pink-500 to-pink-700', emoji: '👨‍🎓' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        case 'parent':
          navigate('/parent/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword(`${roleEmail.split('@')[0].replace(/[^a-z]/g, '')}123`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-10"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-block mb-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl animate-bounce-slow">
                <span className="text-7xl">🎓</span>
              </div>
            </div>
            <h2 className="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">Welcome Back!</h2>
            <p className="text-2xl text-white font-semibold">Login to access your portal</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Login Form - Left Side */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 animate-slideInLeft">
              <div className="text-center mb-8">
                <h3 className="text-4xl font-extrabold text-gradient mb-3">Sign In</h3>
                <p className="text-gray-600 text-lg font-semibold">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    <FaEnvelope className="inline mr-2 text-purple-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full px-5 py-4 pl-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all text-gray-800 font-semibold"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <FaEnvelope className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    <FaLock className="inline mr-2 text-purple-500" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full px-5 py-4 pl-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all text-gray-800 font-semibold"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <FaLock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn btn-primary flex items-center justify-center text-xl py-5 relative overflow-hidden group shadow-2xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loader border-white"></div>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-3 group-hover:translate-x-1 transition-transform text-white" />
                      <span className="text-white font-bold">Login to Portal</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link to="/" className="text-purple-600 hover:text-purple-800 font-bold text-base hover:underline">
                  ← Back to Home
                </Link>
              </div>
            </div>

            {/* Quick Login & Info - Right Side */}
            <div className="space-y-6 animate-slideInRight">
              {/* Quick Login Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h3 className="text-3xl font-extrabold text-gradient mb-3 text-center">Quick Login</h3>
                <p className="text-gray-700 text-center mb-6 font-semibold">Click on any role to auto-fill credentials</p>
                
                <div className="space-y-4">
                  {roles.map((role, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickLogin(role.email)}
                      className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                          {role.emoji}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 text-xl">{role.name}</div>
                          <div className="text-sm text-gray-600 font-semibold">{role.email}</div>
                        </div>
                      </div>
                      <FaSignInAlt className="text-purple-600 text-2xl group-hover:translate-x-2 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Demo Info Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="text-5xl">ℹ️</div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-gray-900 text-xl mb-3">Demo Credentials</h4>
                    <p className="text-base text-gray-800 font-semibold mb-4">
                      All demo passwords: <code className="bg-purple-100 px-3 py-1 rounded-lg text-purple-700 font-bold text-lg">role123</code>
                    </p>
                    <div className="space-y-2 text-base">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                        <span className="font-bold text-gray-900">👨‍💼 Admin:</span>
                        <span className="font-extrabold text-blue-700">admin123</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                        <span className="font-bold text-gray-900">👨‍🏫 Staff:</span>
                        <span className="font-extrabold text-green-700">teacher123</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50">
                        <span className="font-bold text-gray-900">👨‍👩‍👧 Parent:</span>
                        <span className="font-extrabold text-yellow-700">parent123</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-pink-50">
                        <span className="font-bold text-gray-900">👨‍🎓 Student:</span>
                        <span className="font-extrabold text-pink-700">student123</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h4 className="font-extrabold text-gray-900 text-xl mb-6 flex items-center">
                  <span className="text-3xl mr-3">✨</span>
                  Portal Features
                </h4>
                <div className="space-y-4">
                  {[
                    { icon: '🔒', label: 'Secure Authentication', color: 'from-blue-400 to-blue-600' },
                    { icon: '👥', label: 'Role-based Access', color: 'from-green-400 to-green-600' },
                    { icon: '🔔', label: 'Real-time Updates', color: 'from-purple-400 to-purple-600' },
                    { icon: '📱', label: 'Mobile Responsive', color: 'from-pink-400 to-pink-600' }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl">{feature.icon}</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* School Contact Info */}
          <div className="mt-12 text-center animate-fadeIn">
            <div className="inline-block bg-white/20 backdrop-blur-md rounded-2xl px-10 py-6 shadow-2xl border-2 border-white/30">
              <p className="text-white mb-3 font-bold text-lg">Need Help?</p>
              <a 
                href="tel:+917488770476" 
                className="inline-block bg-white text-purple-600 hover:bg-yellow-300 px-8 py-4 rounded-xl font-extrabold text-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                📞 +91 7488770476
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
