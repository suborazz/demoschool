import React, { useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const contactMethods = [
    { 
      icon: FaPhone, 
      title: 'Phone', 
      info: '+91 7488770476', 
      link: 'tel:+917488770476',
      color: 'from-blue-500 to-blue-700',
      emoji: '📞'
    },
    { 
      icon: FaEnvelope, 
      title: 'Email', 
      info: 'info@davschool.edu.in', 
      link: 'mailto:info@davschool.edu.in',
      color: 'from-green-500 to-green-700',
      emoji: '✉️'
    },
    { 
      icon: FaMapMarkerAlt, 
      title: 'Address', 
      info: 'DAV School Campus, India', 
      link: '#',
      color: 'from-purple-500 to-purple-700',
      emoji: '📍'
    },
    { 
      icon: FaClock, 
      title: 'Office Hours', 
      info: 'Mon - Fri, 9:00 AM - 4:00 PM', 
      link: '#',
      color: 'from-pink-500 to-pink-700',
      emoji: '⏰'
    }
  ];

  const socialMedia = [
    { icon: FaFacebook, name: 'Facebook', color: 'from-blue-600 to-blue-800', link: '#' },
    { icon: FaTwitter, name: 'Twitter', color: 'from-cyan-500 to-blue-600', link: '#' },
    { icon: FaInstagram, name: 'Instagram', color: 'from-purple-600 to-pink-600', link: '#' },
    { icon: FaLinkedin, name: 'LinkedIn', color: 'from-blue-700 to-blue-900', link: '#' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/public/contact', formData);
      toast.success('Your message has been sent successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 text-white py-24 overflow-hidden">
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
                💬 Get in Touch
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              <span className="block">Contact</span>
              <span className="block text-yellow-300">DAV School</span>
            </h1>
            <p className="text-2xl md:text-3xl text-purple-100 font-light">
              We'd Love to Hear From You
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods - Beautiful Cards */}
      <section className="py-20 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="stat-card group text-center hover-lift animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">
                  {method.emoji}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{method.title}</h3>
                <p className="text-gray-600 text-sm break-words">{method.info}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Information Sidebar */}
            <div className="lg:col-span-2 space-y-6 animate-slideInLeft">
              {/* Main Info Card */}
              <div className="modern-card p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🏫</div>
                  <h3 className="text-2xl font-bold text-gradient mb-4">Visit Our Campus</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Experience our world-class facilities and meet our dedicated faculty in person.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FaMapMarkerAlt className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Location</p>
                        <p className="text-gray-600 text-sm">DAV School Campus, India</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FaClock className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Visiting Hours</p>
                        <p className="text-gray-600 text-sm">Mon - Fri: 9:00 AM - 4:00 PM</p>
                        <p className="text-gray-600 text-sm">Sat: 9:00 AM - 1:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Card */}
              <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Connect With Us</h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      className="flex flex-col items-center p-4 rounded-xl hover-lift bg-gradient-to-br from-gray-50 to-gray-100 group"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                        <social.icon className="text-white text-2xl" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Contact Card */}
              <div className="modern-card p-8 bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Need Immediate Help?</h3>
                <p className="text-gray-800 text-base mb-6 font-semibold">Call us directly for urgent inquiries</p>
                <a href="tel:+917488770476" className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-center">
                  <FaPhone className="inline mr-3 text-white" />
                  <span className="text-white font-bold">+91 7488770476</span>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 animate-slideInRight">
              <div className="modern-card p-10">
                <div className="text-center mb-8">
                  <div className="inline-block w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-2xl animate-pulse-slow">
                    <FaPaperPlane className="text-white text-4xl" />
                  </div>
                  <h2 className="text-4xl font-extrabold mb-3">
                    <span className="text-gradient">Send us a Message</span>
                  </h2>
                  <p className="text-gray-600 text-lg">Fill out the form and we'll respond within 24 hours</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="input"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="input"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="input"
                        placeholder="+91 XXXXXXXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        className="input"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Message *</label>
                    <textarea
                      name="message"
                      className="input"
                      rows="6"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn btn-primary text-lg py-5 flex items-center justify-center group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="loader border-white"></div>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-3 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="modern-card overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-600 text-xl font-semibold">Map will be displayed here</p>
                <p className="text-gray-500 text-sm mt-2">Google Maps Integration</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
