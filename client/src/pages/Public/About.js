import React from 'react';
import Layout from '../../components/Layout';
import { FaGraduationCap, FaBullseye, FaEye, FaAward, FaTrophy, FaUsers, FaBook, FaFlask, FaBasketballBall, FaTheaterMasks, FaBus, FaUtensils, FaHeartbeat, FaStar, FaRocket, FaGem } from 'react-icons/fa';

const About = () => {
  const facilities = [
    { icon: FaGraduationCap, title: 'Smart Classrooms', desc: 'Modern interactive learning environment with digital boards', color: 'from-blue-500 to-blue-700' },
    { icon: FaBook, title: 'Digital Library', desc: 'Extensive collection of books and e-resources', color: 'from-purple-500 to-purple-700' },
    { icon: FaFlask, title: 'Science Labs', desc: 'Fully equipped Physics, Chemistry & Biology labs', color: 'from-green-500 to-green-700' },
    { icon: FaBasketballBall, title: 'Sports Complex', desc: 'Indoor & outdoor sports facilities', color: 'from-orange-500 to-orange-700' },
    { icon: FaTheaterMasks, title: 'Auditorium', desc: 'Modern auditorium for events & programs', color: 'from-pink-500 to-pink-700' },
    { icon: FaBus, title: 'Transportation', desc: 'Safe and reliable bus service', color: 'from-yellow-500 to-yellow-700' },
    { icon: FaUtensils, title: 'Cafeteria', desc: 'Hygienic and nutritious food', color: 'from-red-500 to-red-700' },
    { icon: FaHeartbeat, title: 'Medical Room', desc: 'First aid and health check-ups', color: 'from-teal-500 to-teal-700' },
    { icon: FaUsers, title: 'Computer Labs', desc: 'Latest technology and equipment', color: 'from-indigo-500 to-indigo-700' }
  ];

  const achievements = [
    { icon: FaTrophy, text: '100% Pass Rate in Board Examinations', color: 'from-yellow-400 to-yellow-600' },
    { icon: FaAward, text: 'Multiple State Level Sports Championships', color: 'from-blue-400 to-blue-600' },
    { icon: FaStar, text: 'Excellence in Science and Mathematics Olympiads', color: 'from-purple-400 to-purple-600' },
    { icon: FaRocket, text: 'Active Community Service Programs', color: 'from-green-400 to-green-600' },
    { icon: FaGem, text: 'Award-winning Cultural Programs', color: 'from-pink-400 to-pink-600' },
    { icon: FaHeartbeat, text: 'Recognition for Environmental Initiatives', color: 'from-teal-400 to-teal-600' }
  ];

  const stats = [
    { number: '25+', label: 'Years of Excellence', icon: '🎓', color: 'from-blue-500 to-purple-600' },
    { number: '1000+', label: 'Happy Students', icon: '👨‍🎓', color: 'from-green-500 to-teal-600' },
    { number: '50+', label: 'Expert Teachers', icon: '👨‍🏫', color: 'from-yellow-500 to-orange-600' },
    { number: '100%', label: 'Pass Rate', icon: '🏆', color: 'from-pink-500 to-red-600' }
  ];

  return (
    <Layout>
      {/* Hero Section with Animated Background */}
      <section className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 text-white py-24 overflow-hidden">
        {/* Animated background elements */}
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
              <span className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold animate-pulse-slow">
                ✨ About Us
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              About <span className="text-yellow-300">DAV School</span>
            </h1>
            <p className="text-2xl md:text-3xl text-purple-100 font-light max-w-3xl mx-auto">
              Excellence in Education Since 1999
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section - Eye-catching */}
      <section className="py-16 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-300 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="stat-card text-center group animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-6xl mb-3 group-hover:scale-125 transition-transform">
                  {stat.icon}
                </div>
                <div className={`text-5xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section - Beautiful Cards */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-5xl font-extrabold mb-4">
              <span className="text-gradient">Our Purpose</span>
            </h2>
            <p className="text-xl text-gray-600">Driving Education Forward with Vision & Mission</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="modern-card group hover-lift relative overflow-hidden animate-slideInLeft">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-4 shadow-xl group-hover:scale-110 transition-transform">
                    <FaBullseye className="text-white text-3xl" />
                  </div>
                  <h3 className="text-3xl font-bold text-gradient">Our Mission</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  To provide <span className="font-bold text-blue-600">excellence in education</span> and create responsible citizens who contribute
                  positively to society. We strive to nurture young minds through innovative teaching
                  methods, character building, and holistic development.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Excellence', 'Innovation', 'Character', 'Growth'].map((tag, i) => (
                    <span key={i} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-sm font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Vision Card */}
            <div className="modern-card group hover-lift relative overflow-hidden animate-slideInRight">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mr-4 shadow-xl group-hover:scale-110 transition-transform">
                    <FaEye className="text-white text-3xl" />
                  </div>
                  <h3 className="text-3xl font-bold text-gradient">Our Vision</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  To be a <span className="font-bold text-purple-600">leading educational institution</span> recognized for academic excellence, character
                  building, and producing future leaders. We envision a community of lifelong learners
                  equipped with skills for success in the 21st century.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Leadership', 'Excellence', 'Future-Ready', 'Global'].map((tag, i) => (
                    <span key={i} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-sm font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="modern-card p-12 animate-fadeIn">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse-slow">
                <FaGraduationCap className="text-white text-4xl" />
              </div>
            </div>
            
            <h2 className="text-4xl font-extrabold text-center mb-8">
              <span className="text-gradient">Who We Are</span>
            </h2>
            
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p className="text-center max-w-4xl mx-auto">
                <span className="font-bold text-purple-600 text-2xl">DAV School</span> is a premier educational institution committed to providing quality education
                and holistic development of students. Established in <span className="font-bold text-blue-600">1999</span>, we have been at the forefront
                of educational excellence in India.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                  <div className="text-4xl mb-3">🏫</div>
                  <h4 className="font-bold text-blue-900 mb-2">State-of-the-art Campus</h4>
                  <p className="text-sm text-blue-700">Modern facilities and infrastructure for optimal learning</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                  <div className="text-4xl mb-3">👨‍🏫</div>
                  <h4 className="font-bold text-purple-900 mb-2">Expert Faculty</h4>
                  <p className="text-sm text-purple-700">Qualified teachers dedicated to student success</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
                  <div className="text-4xl mb-3">📚</div>
                  <h4 className="font-bold text-pink-900 mb-2">Holistic Approach</h4>
                  <p className="text-sm text-pink-700">Balanced focus on academics, sports, and arts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section - Colorful Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-block mb-4">
              <span className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg">
                ✨ World-Class Infrastructure
              </span>
            </div>
            <h2 className="text-5xl font-extrabold mb-4">
              <span className="text-gradient">Our Facilities</span>
            </h2>
            <p className="text-xl text-gray-600">Everything Your Child Needs to Excel</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <div 
                key={index} 
                className="modern-card group text-center hover-lift animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${facility.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl`}>
                  <facility.icon className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{facility.title}</h3>
                <p className="text-gray-600 leading-relaxed">{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section - Stunning Design */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-10"
              style={{
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-block mb-4">
              <span className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold">
                🏆 Our Pride
              </span>
            </div>
            <h2 className="text-5xl font-extrabold mb-4">Our Achievements</h2>
            <p className="text-2xl text-purple-100">A Legacy of Excellence & Success</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl flex items-start space-x-4 group hover-lift animate-fadeInUp shadow-xl border border-white/30"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                  <achievement.icon className="text-white text-2xl" />
                </div>
                <p className="text-gray-800 font-bold leading-relaxed">{achievement.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl font-extrabold mb-6 animate-fadeInUp">
            Join Our Family of Excellence
          </h2>
          <p className="text-2xl mb-10 text-blue-100 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            Be a part of India's leading educational institution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <a href="/admission" className="btn bg-white text-purple-600 hover:bg-yellow-300 text-xl px-10 py-5 inline-flex items-center justify-center shadow-2xl group">
              Apply for Admission
              <FaRocket className="ml-3 group-hover:translate-x-2 transition-transform" />
            </a>
            <a href="/contact" className="btn glass border-2 border-white/30 text-xl px-10 py-5 inline-flex items-center justify-center">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
