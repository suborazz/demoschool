import React from 'react';
import Layout from '../../components/Layout';
import { FaFileContract, FaCheckCircle, FaBan, FaGavel, FaUserShield } from 'react-icons/fa';

const Terms = () => {
  const terms = [
    {
      icon: FaCheckCircle,
      title: 'Acceptance of Terms',
      color: 'from-blue-500 to-blue-700',
      content: 'By accessing and using DAV School\'s services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.'
    },
    {
      icon: FaUserShield,
      title: 'User Accounts',
      color: 'from-green-500 to-green-700',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.'
    },
    {
      icon: FaGavel,
      title: 'Acceptable Use',
      color: 'from-purple-500 to-purple-700',
      content: 'You agree to use our services only for lawful purposes and in accordance with these Terms. You must not use our services in any way that violates any applicable laws or regulations.'
    },
    {
      icon: FaBan,
      title: 'Prohibited Activities',
      color: 'from-red-500 to-red-700',
      content: 'You may not: (a) modify, copy, or distribute our content; (b) reverse engineer any aspect of our services; (c) attempt to gain unauthorized access; (d) harass or harm other users.'
    }
  ];

  const additionalTerms = [
    {
      title: 'Intellectual Property',
      items: [
        'All content on this website is owned by DAV School',
        'You may not reproduce or distribute our content without permission',
        'School logos and trademarks are protected',
        'User-generated content remains the property of respective owners'
      ]
    },
    {
      title: 'Payment Terms',
      items: [
        'All fees must be paid according to the schedule provided',
        'Late payments may incur additional charges',
        'Refund policies are subject to school regulations',
        'Payment information is securely processed'
      ]
    },
    {
      title: 'Service Modifications',
      items: [
        'We reserve the right to modify or discontinue services',
        'Changes will be communicated in advance when possible',
        'Continued use constitutes acceptance of changes',
        'We may update these terms periodically'
      ]
    },
    {
      title: 'Limitation of Liability',
      items: [
        'Services are provided "as is" without warranties',
        'We are not liable for indirect or consequential damages',
        'Our liability is limited to the extent permitted by law',
        'We do not guarantee uninterrupted service availability'
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-500 to-pink-500 text-white py-24 overflow-hidden">
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
                <FaFileContract className="text-5xl" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              Terms of Service
            </h1>
            <p className="text-2xl text-purple-100">
              Please Read These Terms Carefully
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
            <div className="text-6xl mb-6">📜</div>
            <h2 className="text-3xl font-bold text-gradient mb-4">
              Terms & Conditions
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              These Terms of Service govern your use of <span className="font-bold text-purple-600">DAV School's</span> website and services. By using our services, you agree to comply with these terms.
            </p>
          </div>
        </div>
      </section>

      {/* Main Terms */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {terms.map((term, index) => (
              <div 
                key={index}
                className="modern-card p-8 animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${term.color} flex items-center justify-center flex-shrink-0 shadow-xl`}>
                    <term.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 flex-1 pt-2">{term.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{term.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Terms */}
      <section className="py-16 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {additionalTerms.map((section, index) => (
              <div 
                key={index}
                className="modern-card p-8 animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <h3 className="text-2xl font-bold text-gradient mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-purple-500 mr-3 text-lg">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="modern-card p-10 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-5xl mb-4">⚖️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Questions About Terms?
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:legal@davschool.edu.in" className="btn btn-primary">
                Email Legal Team
              </a>
              <a href="/contact" className="btn btn-secondary">
                Contact Us
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-600">
              📞 Phone: +91 7488770476 | ✉️ Email: info@davschool.edu.in
            </p>
          </div>
        </div>
      </section>

      {/* Agreement Notice */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg">
            By continuing to use DAV School services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;

