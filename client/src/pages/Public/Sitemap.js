import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FaHome, FaInfoCircle, FaGraduationCap, FaImages, FaPhone, FaSignInAlt, FaUserShield, FaChalkboardTeacher, FaUsers, FaUserGraduate, FaFileContract, FaShieldAlt, FaMap } from 'react-icons/fa';

const Sitemap = () => {
  const siteLinks = [
    {
      category: 'Main Pages',
      icon: FaHome,
      color: 'from-blue-500 to-blue-700',
      links: [
        { name: 'Home', path: '/', icon: FaHome },
        { name: 'About Us', path: '/about', icon: FaInfoCircle },
        { name: 'Admissions', path: '/admission', icon: FaGraduationCap },
        { name: 'Gallery', path: '/gallery', icon: FaImages },
        { name: 'Contact Us', path: '/contact', icon: FaPhone }
      ]
    },
    {
      category: 'Authentication',
      icon: FaSignInAlt,
      color: 'from-green-500 to-green-700',
      links: [
        { name: 'Login', path: '/login', icon: FaSignInAlt }
      ]
    },
    {
      category: 'Admin Portal',
      icon: FaUserShield,
      color: 'from-purple-500 to-purple-700',
      links: [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: FaUserShield },
        { name: 'Manage Students', path: '/admin/students', icon: FaUserGraduate },
        { name: 'Manage Staff', path: '/admin/staff', icon: FaChalkboardTeacher },
        { name: 'Manage Classes', path: '/admin/classes', icon: FaGraduationCap },
        { name: 'Manage Fees', path: '/admin/fees', icon: FaFileContract },
        { name: 'Reports', path: '/admin/reports', icon: FaFileContract }
      ]
    },
    {
      category: 'Staff Portal',
      icon: FaChalkboardTeacher,
      color: 'from-yellow-500 to-yellow-700',
      links: [
        { name: 'Staff Dashboard', path: '/staff/dashboard', icon: FaChalkboardTeacher },
        { name: 'Mark Attendance', path: '/staff/attendance', icon: FaFileContract },
        { name: 'Manage Grades', path: '/staff/grades', icon: FaFileContract },
        { name: 'LMS Management', path: '/staff/lms', icon: FaFileContract }
      ]
    },
    {
      category: 'Parent Portal',
      icon: FaUsers,
      color: 'from-pink-500 to-pink-700',
      links: [
        { name: 'Parent Dashboard', path: '/parent/dashboard', icon: FaUsers },
        { name: 'Child Attendance', path: '/parent/attendance/:childId', icon: FaFileContract },
        { name: 'Child Grades', path: '/parent/grades/:childId', icon: FaFileContract },
        { name: 'Child Fees', path: '/parent/fees/:childId', icon: FaFileContract }
      ]
    },
    {
      category: 'Student Portal',
      icon: FaUserGraduate,
      color: 'from-teal-500 to-teal-700',
      links: [
        { name: 'Student Dashboard', path: '/student/dashboard', icon: FaUserGraduate },
        { name: 'My Attendance', path: '/student/attendance', icon: FaFileContract },
        { name: 'My Grades', path: '/student/grades', icon: FaFileContract },
        { name: 'Learning Materials', path: '/student/lms', icon: FaFileContract }
      ]
    },
    {
      category: 'Legal',
      icon: FaShieldAlt,
      color: 'from-gray-500 to-gray-700',
      links: [
        { name: 'Privacy Policy', path: '/privacy', icon: FaShieldAlt },
        { name: 'Terms of Service', path: '/terms', icon: FaFileContract },
        { name: 'Sitemap', path: '/sitemap', icon: FaMap }
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 text-white py-24 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fadeInUp">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 animate-pulse-slow">
                <FaMap className="text-5xl" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              Sitemap
            </h1>
            <p className="text-2xl text-purple-100">
              Navigate DAV School Website
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="stat-card text-center">
              <div className="text-5xl mb-2">🌐</div>
              <div className="text-4xl font-extrabold text-gradient mb-1">{siteLinks.length}</div>
              <div className="text-gray-600 font-semibold">Categories</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-5xl mb-2">📄</div>
              <div className="text-4xl font-extrabold text-gradient mb-1">
                {siteLinks.reduce((acc, cat) => acc + cat.links.length, 0)}
              </div>
              <div className="text-gray-600 font-semibold">Total Pages</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-5xl mb-2">🔐</div>
              <div className="text-4xl font-extrabold text-gradient mb-1">4</div>
              <div className="text-gray-600 font-semibold">Portals</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-5xl mb-2">✨</div>
              <div className="text-4xl font-extrabold text-gradient mb-1">100%</div>
              <div className="text-gray-600 font-semibold">Accessible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteLinks.map((category, index) => (
              <div 
                key={index}
                className="modern-card p-8 group hover-lift animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mr-4 shadow-xl group-hover:scale-110 transition-transform`}>
                    <category.icon className="text-white text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{category.category}</h2>
                </div>
                
                <ul className="space-y-3">
                  {category.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        to={link.path}
                        className="flex items-center text-gray-700 hover:text-purple-600 transition-colors group/link"
                      >
                        <link.icon className="mr-3 text-purple-400 group-hover/link:text-purple-600" />
                        <span className="group-hover/link:translate-x-1 transition-transform inline-block">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="modern-card p-10 text-center">
            <div className="text-6xl mb-6">🧭</div>
            <h2 className="text-3xl font-bold text-gradient mb-4">
              Need Help Finding Something?
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              Can't find what you're looking for? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn btn-primary">
                Contact Us
              </Link>
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Banner */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Quick Access</h3>
              <p className="text-purple-100">Most visited pages on our website</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/" className="btn glass border-2 border-white/30">Home</Link>
              <Link to="/admission" className="btn glass border-2 border-white/30">Admissions</Link>
              <Link to="/contact" className="btn glass border-2 border-white/30">Contact</Link>
              <Link to="/login" className="btn bg-white text-purple-600 hover:bg-yellow-300">Login</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Sitemap;

