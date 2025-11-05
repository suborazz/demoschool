import Layout from '../components/Layout';
import Link from 'next/link';

export default function Sitemap() {
  const pageCategories = [
    {
      category: '🏠 Main Pages',
      icon: '🌐',
      color: 'from-blue-500 to-purple-500',
      pages: [
        { title: 'Home', url: '/', icon: '🏠', description: 'Welcome to DAV School' },
        { title: 'About', url: '/about', icon: 'ℹ️', description: 'Learn about our school' },
        { title: 'Admission', url: '/admission', icon: '📝', description: 'Join our school community' },
        { title: 'Gallery', url: '/gallery', icon: '📸', description: 'View school photos and events' },
        { title: 'Contact', url: '/contact', icon: '📞', description: 'Get in touch with us' },
      ]
    },
    {
      category: '👥 User Access',
      icon: '🔐',
      color: 'from-purple-500 to-pink-500',
      pages: [
        { title: 'Login', url: '/login', icon: '🔑', description: 'Access your account' },
        { title: 'Student Dashboard', url: '/student/dashboard', icon: '🎓', description: 'Student portal' },
        { title: 'Parent Dashboard', url: '/parent/dashboard', icon: '👨‍👩‍👧', description: 'Parent portal' },
        { title: 'Staff Dashboard', url: '/staff/dashboard', icon: '👨‍🏫', description: 'Staff portal' },
        { title: 'Admin Dashboard', url: '/admin/dashboard', icon: '⚙️', description: 'Admin portal' },
      ]
    },
    {
      category: '📋 Admin Features',
      icon: '💼',
      color: 'from-pink-500 to-red-500',
      pages: [
        { title: 'Students Management', url: '/admin/students', icon: '👨‍🎓', description: 'Manage student records' },
        { title: 'Staff Management', url: '/admin/staff', icon: '👥', description: 'Manage staff members' },
        { title: 'Classes Management', url: '/admin/classes', icon: '🏫', description: 'Manage classes and sections' },
        { title: 'Attendance', url: '/admin/attendance', icon: '📊', description: 'Track attendance records' },
        { title: 'Fees Management', url: '/admin/fees', icon: '💰', description: 'Manage school fees' },
        { title: 'Calendar', url: '/admin/calendar', icon: '📅', description: 'School calendar events' },
        { title: 'Notifications', url: '/admin/notifications', icon: '🔔', description: 'Send notifications' },
        { title: 'Reports', url: '/admin/reports', icon: '📈', description: 'View analytics and reports' },
      ]
    },
    {
      category: '📄 Legal & Info',
      icon: '⚖️',
      color: 'from-green-500 to-teal-500',
      pages: [
        { title: 'Privacy Policy', url: '/privacy', icon: '🔒', description: 'Our privacy commitments' },
        { title: 'Terms of Service', url: '/terms', icon: '📜', description: 'Usage terms and conditions' },
        { title: 'Sitemap', url: '/sitemap', icon: '🗺️', description: 'Site navigation map' },
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        <div className="container-custom relative z-10 text-center py-20">
          <div className="animate-fadeInUp">
            <div className="inline-block mb-6">
              <div className="text-7xl animate-bounce-slow">🗺️</div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 neon-text">
              Sitemap
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-light">
              Navigate through all pages
            </p>
            <div className="glass-card inline-block px-8 py-4 rounded-2xl">
              <p className="text-white font-semibold">
                Complete overview of the DAV School Management System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-gradient-to-b from-indigo-50 via-white to-purple-50 py-20">
        <div className="container-custom">
          {/* Introduction Card */}
          <div className="card-gradient max-w-4xl mx-auto mb-20 animate-fadeInUp text-center">
            <h2 className="text-3xl font-bold text-gradient mb-4">
              Explore Our Platform
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Find everything you need quickly. Browse through all available pages organized by category.
            </p>
          </div>

          {/* Sitemap Categories */}
          <div className="space-y-16">
            {pageCategories.map((category, categoryIndex) => (
              <div 
                key={categoryIndex}
                className="animate-fadeInUp"
                style={{ animationDelay: `${categoryIndex * 0.1}s` }}
              >
                {/* Category Header */}
                <div className="flex items-center mb-8">
                  <div className={`text-5xl mr-4 animate-float`}>
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">
                      {category.category}
                    </h2>
                    <div className={`h-1 w-32 mt-2 rounded-full bg-gradient-to-r ${category.color}`}></div>
                  </div>
                </div>

                {/* Pages Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.pages.map((page, pageIndex) => (
                    <Link 
                      key={pageIndex} 
                      href={page.url}
                      className="card hover-lift hover:shadow-purple-200 group cursor-pointer"
                    >
                      <div className="flex items-start">
                        <div className="text-4xl mr-4 group-hover:scale-125 transition-transform duration-300">
                          {page.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {page.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {page.description}
                          </p>
                          <div className="mt-3 flex items-center text-purple-600 font-semibold text-sm">
                            <span>Visit page</span>
                            <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-20 grid md:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-3">📄</div>
              <div className="text-3xl font-black text-gradient mb-2">
                {pageCategories.reduce((acc, cat) => acc + cat.pages.length, 0)}
              </div>
              <p className="text-gray-600 font-semibold">Total Pages</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-3xl font-black text-gradient mb-2">4</div>
              <p className="text-gray-600 font-semibold">Categories</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">👥</div>
              <div className="text-3xl font-black text-gradient mb-2">5</div>
              <p className="text-gray-600 font-semibold">User Portals</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <div className="text-3xl font-black text-gradient mb-2">8</div>
              <p className="text-gray-600 font-semibold">Admin Tools</p>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-center text-white shadow-2xl gradient-animate">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-6 animate-bounce-slow">🤔</div>
              <h2 className="text-4xl font-black mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                If you need help navigating the platform or have questions about any feature, 
                our support team is here to assist you!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/contact" 
                  className="glass-card px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all transform hover:scale-105"
                >
                  Contact Us
                </Link>
                <Link 
                  href="/about" 
                  className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

