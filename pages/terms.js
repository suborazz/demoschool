import Layout from '../components/Layout';
import Link from 'next/link';

export default function Terms() {
  const sections = [
    {
      icon: '✅',
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using the DAV School Management System, you accept and agree to be bound by these Terms of Service',
        'If you do not agree to these terms, please do not use our platform',
        'We reserve the right to update these terms at any time',
        'Your continued use of the platform constitutes acceptance of updated terms',
        'These terms apply to all users including students, parents, staff, and administrators'
      ]
    },
    {
      icon: '👤',
      title: 'User Accounts',
      content: [
        'You must provide accurate and complete information when creating an account',
        'You are responsible for maintaining the confidentiality of your account credentials',
        'You must notify us immediately of any unauthorized access to your account',
        'One account per user - sharing accounts is strictly prohibited',
        'Accounts may be suspended or terminated for violations of these terms',
        'Parents must supervise their children\'s use of the platform'
      ]
    },
    {
      icon: '🎓',
      title: 'Acceptable Use',
      content: [
        'Use the platform only for legitimate educational purposes',
        'Do not post or share inappropriate, offensive, or harmful content',
        'Respect the privacy and rights of other users',
        'Do not attempt to hack, disrupt, or compromise platform security',
        'Do not use the platform for commercial purposes without authorization',
        'Follow all school policies and guidelines when using the system'
      ]
    },
    {
      icon: '🚫',
      title: 'Prohibited Activities',
      content: [
        'Transmitting viruses, malware, or other malicious code',
        'Impersonating other users or providing false information',
        'Harassing, bullying, or threatening other users',
        'Violating any applicable laws or regulations',
        'Scraping, data mining, or unauthorized data extraction',
        'Attempting to gain unauthorized access to any part of the system'
      ]
    },
    {
      icon: '💳',
      title: 'Fees & Payments',
      content: [
        'School fees and payment schedules are set by school administration',
        'All payments must be made through authorized payment methods',
        'Payment receipts and records are maintained in your account',
        'Late payments may incur penalties as per school policy',
        'Refund policies are determined by school administration',
        'You are responsible for keeping payment information up to date'
      ]
    },
    {
      icon: '📚',
      title: 'Content & Intellectual Property',
      content: [
        'All platform content and materials are owned by DAV School or its licensors',
        'You may not copy, modify, or distribute platform content without permission',
        'User-generated content remains the property of the respective users',
        'By submitting content, you grant us a license to use it for platform operations',
        'We reserve the right to remove any content that violates our policies',
        'Trademarks and logos are protected by intellectual property laws'
      ]
    },
    {
      icon: '⚠️',
      title: 'Disclaimers & Limitations',
      content: [
        'The platform is provided "as is" without warranties of any kind',
        'We do not guarantee uninterrupted or error-free service',
        'We are not liable for any indirect, incidental, or consequential damages',
        'We are not responsible for third-party content or external links',
        'Service availability may be affected by maintenance or technical issues',
        'Users are responsible for maintaining their own data backups'
      ]
    },
    {
      icon: '🔧',
      title: 'Service Modifications',
      content: [
        'We may modify, suspend, or discontinue any part of the service',
        'Features may be added, changed, or removed without prior notice',
        'We will attempt to provide notice for major changes when possible',
        'Temporary maintenance and updates may interrupt service',
        'We continuously improve the platform based on user feedback',
        'Critical security updates may be deployed immediately'
      ]
    },
    {
      icon: '⚖️',
      title: 'Termination',
      content: [
        'We may suspend or terminate your account for violations of these terms',
        'You may request account deletion subject to legal and regulatory requirements',
        'Upon termination, your access to the platform will be immediately revoked',
        'Certain data may be retained as required by law or school policy',
        'Fees paid are generally non-refundable upon termination',
        'We reserve the right to refuse service to anyone'
      ]
    },
    {
      icon: '📍',
      title: 'Governing Law',
      content: [
        'These terms are governed by applicable local and national laws',
        'Any disputes shall be resolved in the appropriate jurisdiction',
        'You agree to comply with all applicable educational regulations',
        'We comply with data protection and privacy laws',
        'These terms constitute the entire agreement between you and DAV School',
        'If any provision is found invalid, the remaining provisions remain in effect'
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-32 right-20 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        <div className="container-custom relative z-10 text-center py-20">
          <div className="animate-fadeInUp">
            <div className="inline-block mb-6">
              <div className="text-7xl animate-bounce-slow">📜</div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 neon-text">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-light">
              Guidelines for using our platform
            </p>
            <p className="text-lg text-white/80 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="glass-card inline-block px-8 py-4 rounded-2xl">
              <p className="text-white font-semibold">
                Please read these terms carefully before using the DAV School Management System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-gradient-to-b from-blue-50 via-white to-purple-50 py-20">
        <div className="container-custom">
          {/* Introduction Card */}
          <div className="card-gradient max-w-4xl mx-auto mb-20 animate-fadeInUp">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gradient mb-6">
                Welcome to Our Community
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of the DAV School Management System. 
                By creating an account or using our services, you agree to comply with these Terms.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We&apos;ve worked hard to make these terms clear and straightforward. If you have any questions, 
                please don&apos;t hesitate to contact us.
              </p>
            </div>
          </div>

          {/* Terms Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="card hover-lift hover:shadow-blue-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start mb-6">
                  <div className="text-5xl mr-4 animate-float">
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <span className="text-blue-500 font-bold mr-3 mt-1">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start">
                <div className="text-5xl mr-6">⚡</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Important Notice</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Violation of these Terms of Service may result in:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-3">▸</span>
                      <span>Temporary suspension of account access</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-3">▸</span>
                      <span>Permanent termination of account</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-3">▸</span>
                      <span>Reporting to school administration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 font-bold mr-3">▸</span>
                      <span>Legal action in cases of severe violations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center text-white shadow-2xl animate-fadeInUp gradient-animate">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-6 animate-bounce-slow">💬</div>
              <h2 className="text-4xl font-black mb-4">Questions About Our Terms?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                If you have any questions or need clarification about these Terms of Service, 
                we&apos;re here to help!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/contact" 
                  className="glass-card px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all transform hover:scale-105"
                >
                  Contact Support
                </Link>
                <a 
                  href="mailto:sstm476@gmail.com" 
                  className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  sstm476@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="card-gradient">
              <h3 className="text-2xl font-bold text-gradient mb-6">Changes to Terms</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any 
                material changes by posting a notice on the platform or sending an email notification.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Changes will take effect immediately upon posting unless otherwise specified. Your continued use 
                of the platform after changes are posted constitutes your acceptance of the modified terms.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mt-6">
                <p className="text-gray-800 font-semibold mb-2">💡 Pro Tip:</p>
                <p className="text-gray-700">
                  We recommend checking this page periodically to stay informed about any updates. The &quot;Last updated&quot; 
                  date at the top of the page will help you identify when changes were made.
                </p>
              </div>
            </div>
          </div>

          {/* Agreement Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
              <div className="text-center">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Agreement</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  By using the DAV School Management System, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/privacy" 
                className="btn-secondary hover-lift"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/about" 
                className="btn-secondary hover-lift"
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="btn-secondary hover-lift"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

