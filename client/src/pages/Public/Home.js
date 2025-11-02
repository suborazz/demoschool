import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FaGraduationCap, FaUsers, FaTrophy, FaBook, FaArrowRight, FaStar, FaHeart, FaRocket, FaAward } from 'react-icons/fa';

const Home = () => {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, awards: 0, years: 0 });

  useEffect(() => {
    // Animated counter
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;
    
    const targets = { students: 1000, teachers: 50, awards: 100, years: 25 };
    let current = { students: 0, teachers: 0, awards: 0, years: 0 };

    const timer = setInterval(() => {
      let completed = 0;
      Object.keys(targets).forEach(key => {
        if (current[key] < targets[key]) {
          current[key] = Math.min(current[key] + Math.ceil(targets[key] / steps), targets[key]);
        } else {
          completed++;
        }
      });
      
      setCounts({ ...current });
      
      if (completed === 4) clearInterval(timer);
    }, increment);

    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      {/* Hero Section with Animated Background */}
      <section className="hero-gradient text-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold animate-pulse-slow">
                🎓 Welcome to Excellence
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fadeInUp">
              <span className="block">DAV School</span>
              <span className="block text-yellow-300 mt-2">Where Dreams Take Flight</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto animate-fadeIn" style={{animationDelay: '0.2s'}}>
              Empowering Young Minds Through Innovation, Excellence, and Holistic Development
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <Link to="/admission" className="btn btn-warning text-lg px-8 py-4 inline-flex items-center justify-center group">
                Apply for Admission
                <FaRocket className="ml-2 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link to="/about" className="btn glass text-lg px-8 py-4 inline-flex items-center justify-center group border-2 border-white/30">
                Learn More
                <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            {/* Floating Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm animate-fadeIn" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center glass px-4 py-2 rounded-full">
                <FaStar className="text-yellow-400 mr-2" />
                <span>CBSE Affiliated</span>
              </div>
              <div className="flex items-center glass px-4 py-2 rounded-full">
                <FaAward className="text-yellow-400 mr-2" />
                <span>Award Winning</span>
              </div>
              <div className="flex items-center glass px-4 py-2 rounded-full">
                <FaHeart className="text-red-400 mr-2" />
                <span>Student Focused</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="stat-card text-center group">
              <div className="text-5xl font-extrabold text-gradient mb-2">{counts.students}+</div>
              <div className="text-gray-600 font-semibold flex items-center justify-center">
                <FaGraduationCap className="mr-2 text-purple-500 group-hover:animate-bounce" />
                Students
              </div>
            </div>
            <div className="stat-card text-center group">
              <div className="text-5xl font-extrabold text-gradient-pink mb-2">{counts.teachers}+</div>
              <div className="text-gray-600 font-semibold flex items-center justify-center">
                <FaUsers className="mr-2 text-pink-500 group-hover:animate-bounce" />
                Teachers
              </div>
            </div>
            <div className="stat-card text-center group">
              <div className="text-5xl font-extrabold text-gradient-blue mb-2">{counts.awards}%</div>
              <div className="text-gray-600 font-semibold flex items-center justify-center">
                <FaTrophy className="mr-2 text-yellow-500 group-hover:animate-bounce" />
                Pass Rate
              </div>
            </div>
            <div className="stat-card text-center group">
              <div className="text-5xl font-extrabold text-gradient mb-2">{counts.years}+</div>
              <div className="text-gray-600 font-semibold flex items-center justify-center">
                <FaAward className="mr-2 text-green-500 group-hover:animate-bounce" />
                Years
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-400 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Why Choose DAV School?</span>
            </h2>
            <p className="text-xl text-gray-600">Excellence in Every Aspect of Education</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaGraduationCap, title: 'Quality Education', desc: 'Top-notch faculty and modern teaching methods', color: 'from-blue-500 to-purple-600', delay: '0s' },
              { icon: FaUsers, title: 'Expert Faculty', desc: 'Experienced teachers dedicated to student success', color: 'from-green-500 to-teal-600', delay: '0.1s' },
              { icon: FaTrophy, title: 'Excellence', desc: '100% pass rate with outstanding results', color: 'from-yellow-500 to-orange-600', delay: '0.2s' },
              { icon: FaBook, title: 'Modern Facilities', desc: 'Smart classrooms, labs, library & sports', color: 'from-purple-500 to-pink-600', delay: '0.3s' }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="modern-card text-center group hover-lift animate-fadeInUp"
                style={{animationDelay: feature.delay}}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl`}>
                  <feature.icon className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals Section - Colorful & Interactive */}
      <section className="py-20 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-200 rounded-full filter blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Access Your Portal</h2>
            <p className="text-xl text-purple-100">Secure and Easy Login for All Users</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Admin', icon: '👨‍💼', color: 'from-blue-400 to-blue-600', desc: 'Complete System Control' },
              { name: 'Staff', icon: '👨‍🏫', color: 'from-green-400 to-green-600', desc: 'Teaching & Management' },
              { name: 'Parent', icon: '👨‍👩‍👧', color: 'from-yellow-400 to-yellow-600', desc: 'Track Your Child' },
              { name: 'Student', icon: '👨‍🎓', color: 'from-pink-400 to-pink-600', desc: 'Learning Dashboard' }
            ].map((portal, index) => (
              <Link
                key={index}
                to="/login"
                className="portal-card group"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                    {portal.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gradient">{portal.name} Portal</h3>
                  <p className="text-gray-600 mb-4">{portal.desc}</p>
                  <div className={`inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r ${portal.color} text-white font-semibold shadow-lg transform group-hover:scale-105 transition-all`}>
                    Login Now
                    <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Eye-catching */}
      <section className="py-24 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full opacity-10"
                style={{
                  width: `${Math.random() * 50 + 10}px`,
                  height: `${Math.random() * 50 + 10}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fadeInUp">
            Ready to Join DAV School?
          </h2>
          <p className="text-2xl mb-10 text-purple-100 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            Start Your Journey Towards Excellence Today!
          </p>
          <Link 
            to="/admission" 
            className="btn bg-white text-purple-600 hover:bg-yellow-300 text-xl px-10 py-5 inline-flex items-center justify-center shadow-2xl animate-bounce-slow group"
          >
            Apply Now
            <FaRocket className="ml-3 group-hover:translate-x-2 transition-transform text-2xl" />
          </Link>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Have Questions?</h3>
              <p className="text-gray-300">We're here to help you!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:+917488770476" className="btn btn-warning inline-flex items-center justify-center">
                📞 +91 7488770476
              </a>
              <Link to="/contact" className="btn glass border-2 border-white/30 inline-flex items-center justify-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
