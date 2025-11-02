import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaGraduationCap } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold">DAV School</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Committed to providing quality education and holistic development of students.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: FaFacebook, color: 'from-blue-500 to-blue-700', url: 'https://facebook.com' },
                { icon: FaTwitter, color: 'from-cyan-500 to-blue-500', url: 'https://twitter.com' },
                { icon: FaInstagram, color: 'from-purple-500 to-pink-500', url: 'https://instagram.com' },
                { icon: FaLinkedin, color: 'from-blue-600 to-blue-800', url: 'https://linkedin.com' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 mr-2 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Admission', 'Gallery', 'Contact Us'].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item === 'Home' ? '/' : `/${item.replace(' ', '').toLowerCase()}`}
                    className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    → {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 mr-2 rounded-full"></span>
              Portals
            </h3>
            <ul className="space-y-2">
              {['Admin Portal', 'Staff Portal', 'Parent Portal', 'Student Portal'].map((portal, index) => (
                <li key={index}>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    → {portal}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 mr-2 rounded-full"></span>
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                  <FaPhone className="text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <a href="tel:+917488770476" className="text-white font-semibold hover:text-purple-300">
                    +91 7488770476
                  </a>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                  <FaEnvelope className="text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <a href="mailto:info@davschool.edu.in" className="text-white font-semibold hover:text-purple-300">
                    info@davschool.edu.in
                  </a>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                  <FaMapMarkerAlt className="text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <span className="text-white font-semibold">India</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-center md:text-left mb-4 md:mb-0">
              <p className="flex items-center justify-center md:justify-start">
                Made with <FaHeart className="text-red-500 mx-2 animate-pulse-slow" /> by DAV School Team
              </p>
              <p className="text-sm mt-1">
                &copy; {currentYear} DAV School. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6 text-sm text-gray-300">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
