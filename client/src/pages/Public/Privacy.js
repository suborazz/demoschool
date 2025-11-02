import React from 'react';
import Layout from '../../components/Layout';
import { FaShieldAlt, FaLock, FaUserSecret, FaCookie, FaDatabase, FaEnvelope } from 'react-icons/fa';

const Privacy = () => {
  const sections = [
    {
      icon: FaDatabase,
      title: 'Information We Collect',
      color: 'from-blue-500 to-blue-700',
      content: [
        'Personal identification information (Name, email address, phone number)',
        'Student academic records and performance data',
        'Attendance and behavioral information',
        'Payment and billing information',
        'Photos and videos for school activities'
      ]
    },
    {
      icon: FaLock,
      title: 'How We Use Your Information',
      color: 'from-green-500 to-green-700',
      content: [
        'To provide and maintain our educational services',
        'To notify you about changes to our services',
        'To provide customer support',
        'To gather analysis to improve our services',
        'To monitor the usage of our services',
        'To detect and prevent technical issues'
      ]
    },
    {
      icon: FaShieldAlt,
      title: 'Data Security',
      color: 'from-purple-500 to-purple-700',
      content: [
        'We use encryption for data transmission',
        'Regular security audits and updates',
        'Access controls and authentication',
        'Secure backup systems',
        'Staff training on data protection'
      ]
    },
    {
      icon: FaUserSecret,
      title: 'Your Rights',
      color: 'from-pink-500 to-pink-700',
      content: [
        'Access your personal data',
        'Correct inaccurate data',
        'Request deletion of data',
        'Object to data processing',
        'Data portability',
        'Withdraw consent at any time'
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 text-white py-24 overflow-hidden">
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
                <FaShieldAlt className="text-5xl" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              Privacy Policy
            </h1>
            <p className="text-2xl text-purple-100">
              Your Privacy is Our Priority
            </p>
            <p className="text-sm mt-4 text-purple-200">
              Last Updated: November 2, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="modern-card p-10 text-center animate-fadeInUp">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold text-gradient mb-4">
              We Value Your Privacy
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              At <span className="font-bold text-purple-600">DAV School</span>, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="modern-card p-8 group hover-lift animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-start space-x-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform`}>
                    <section.icon className="text-white text-3xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-purple-500 mr-3 text-xl">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Sections */}
      <section className="py-16 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="modern-card p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mr-4 shadow-lg">
                  <FaCookie className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Cookies Policy</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
              </p>
            </div>

            <div className="modern-card p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mr-4 shadow-lg">
                  <FaEnvelope className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Contact Us</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@davschool.edu.in
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +91 7488770476
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-6">📧</div>
          <h2 className="text-4xl font-bold mb-4">Questions About Privacy?</h2>
          <p className="text-xl mb-8 text-purple-100">
            We're here to help. Contact us anytime.
          </p>
          <a href="/contact" className="btn bg-white text-purple-600 hover:bg-yellow-300 text-lg px-8 py-4 inline-flex items-center justify-center shadow-xl">
            Contact Us
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;

