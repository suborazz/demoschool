import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaGraduationCap } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'parent':
        return '/parent/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-xl relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-extrabold text-gradient">DAV School</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {['Home', 'About', 'Admission', 'Gallery', 'Contact'].map((item) => (
                <Link
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 font-semibold transition-all hover:scale-105 relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center glass-card px-4 py-2 rounded-xl hover-lift"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold mr-2 shadow-lg">
                    {user.firstName?.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger flex items-center shadow-lg"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary shadow-lg">
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-purple-600 p-2"
            >
              {isOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-br from-purple-50 to-pink-50">
            {['Home', 'About', 'Admission', 'Gallery', 'Contact'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="block text-gray-700 hover:text-purple-600 hover:bg-white px-3 py-3 rounded-xl font-semibold transition-all"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block text-gray-700 hover:text-purple-600 hover:bg-white px-3 py-3 rounded-xl font-semibold transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-red-600 hover:bg-white px-3 py-3 rounded-xl font-semibold transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-gray-700 hover:text-purple-600 hover:bg-white px-3 py-3 rounded-xl font-semibold transition-all"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
