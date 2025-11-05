import Layout from '../components/Layout';
import Link from 'next/link';

export default function Privacy() {
  const sections = [
    {
      icon: '🔐',
      title: 'Information We Collect',
      content: [
        'Personal Information: Name, email address, phone number, and date of birth',
        'Student Records: Academic records, attendance, grades, and performance data',
        'Financial Information: Fee payment records and transaction history',
        'Usage Data: How you interact with our platform, including login times and feature usage',
        'Device Information: Browser type, IP address, and device identifiers'
      ]
    },
    {
      icon: '💡',
      title: 'How We Use Your Information',
      content: [
        'Provide and maintain our school management services',
        'Process fee payments and maintain financial records',
        'Send important notifications about academic activities',
        'Improve and personalize user experience',
        'Ensure security and prevent unauthorized access',
        'Comply with legal obligations and educational regulations'
      ]
    },
    {
      icon: '🛡️',
      title: 'Data Security',
      content: [
        'We implement industry-standard security measures to protect your data',
        'All sensitive information is encrypted in transit and at rest',
        'Regular security audits and vulnerability assessments',
        'Restricted access to personal information on a need-to-know basis',
        'Secure backup systems to prevent data loss',
        'Multi-factor authentication for enhanced account security'
      ]
    },
    {
      icon: '👥',
      title: 'Information Sharing',
      content: [
        'We do not sell or rent your personal information to third parties',
        'Information may be shared with authorized school staff and administrators',
                        'Parents have access to their children&apos;s academic information',
        'We may share data with service providers who assist in operations',
        'Legal authorities may receive information if required by law',
        'Third-party sharing always follows strict confidentiality agreements'
      ]
    },
    {
      icon: '🎯',
      title: 'Your Rights',
      content: [
        'Access: View your personal information stored in our system',
        'Correction: Request corrections to inaccurate information',
        'Deletion: Request deletion of your data (subject to legal requirements)',
        'Portability: Request a copy of your data in a portable format',
        'Opt-out: Unsubscribe from non-essential communications',
        'Privacy Concerns: Contact us about any privacy-related issues'
      ]
    },
    {
      icon: '🍪',
      title: 'Cookies & Tracking',
      content: [
        'We use cookies to enhance user experience and maintain sessions',
        'Essential cookies are required for platform functionality',
        'Analytics cookies help us understand usage patterns',
        'You can manage cookie preferences in your browser settings',
        'We do not use cookies for advertising purposes',
        'Session data is automatically cleared upon logout'
      ]
    },
    {
      icon: '👶',
      title: 'Children\'s Privacy',
      content: [
        'We are committed to protecting the privacy of minors',
        'Parental consent is required for students under 13 years',
        'Parents can access and manage their children\'s information',
        'Special safeguards are in place for student data',
        'We comply with COPPA and other child protection regulations',
        'Student data is only used for educational purposes'
      ]
    },
    {
      icon: '🔄',
      title: 'Data Retention',
      content: [
        'Student records are retained as per educational regulations',
        'Financial records are kept for accounting and audit purposes',
        'Inactive accounts may be archived after extended periods',
        'You can request early deletion subject to legal requirements',
        'Backup data is automatically purged after designated periods',
        'Historical data is anonymized when no longer needed'
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden gradient-purple-pink">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        <div className="container-custom relative z-10 text-center py-20">
          <div className="animate-fadeInUp">
            <div className="inline-block mb-6">
              <div className="text-7xl animate-bounce-slow">🔒</div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 neon-text">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-light">
              Your privacy is our priority
            </p>
            <p className="text-lg text-white/80 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="glass-card inline-block px-8 py-4 rounded-2xl">
              <p className="text-white font-semibold">
                We are committed to protecting your personal information and your right to privacy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-gradient-to-b from-purple-50 via-white to-pink-50 py-20">
        <div className="container-custom">
          {/* Introduction Card */}
          <div className="card-gradient max-w-4xl mx-auto mb-20 animate-fadeInUp">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gradient mb-6">
                Welcome to DAV School Management System
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                At DAV School, we respect your privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our school management system.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the platform.
              </p>
            </div>
          </div>

          {/* Privacy Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="card hover-lift hover:shadow-purple-200"
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
                      <span className="text-purple-500 font-bold mr-3 mt-1">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 p-12 text-center text-white shadow-2xl animate-fadeInUp gradient-animate">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-6 animate-bounce-slow">📧</div>
              <h2 className="text-4xl font-black mb-4">Questions About Privacy?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                If you have any questions or concerns about this Privacy Policy or our data practices, 
                please don&apos;t hesitate to contact us.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/contact" 
                  className="glass-card px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all transform hover:scale-105"
                >
                  Contact Us
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
              <h3 className="text-2xl font-bold text-gradient mb-6">Updates to This Policy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for 
                other operational, legal, or regulatory reasons. We will notify you of any material changes by 
                posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We encourage you to review this Privacy Policy periodically to stay informed about how we are 
                protecting your information. Your continued use of the platform after any changes indicates your 
                acceptance of the updated Privacy Policy.
              </p>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-xl mt-6">
                <p className="text-gray-800 font-semibold mb-2">📌 Important Note:</p>
                <p className="text-gray-700">
                  This privacy policy applies exclusively to the DAV School Management System. It does not apply 
                  to any third-party websites, applications, or services that may be linked from our platform.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Policies</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/terms" 
                className="btn-secondary hover-lift"
              >
                Terms of Service
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

