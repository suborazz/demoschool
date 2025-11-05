import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaSchool,
  FaPaperPlane, FaFacebook, FaTwitter, FaInstagram, FaLinkedin,
  FaComments, FaBolt, FaCheckCircle, FaArrowRight
} from 'react-icons/fa';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const contactInfo = [
    { 
      icon: FaPhone, 
      label: 'Phone', 
      value: '+91 7488770476',
      gradient: 'from-pink-500 via-red-500 to-pink-600'
    },
    { 
      icon: FaEnvelope, 
      label: 'Email', 
      value: 'sstm476@gmail.com',
      gradient: 'from-purple-500 via-pink-500 to-purple-600'
    },
    { 
      icon: FaMapMarkerAlt, 
      label: 'Address', 
      value: 'School Campus, India',
      gradient: 'from-red-500 via-pink-500 to-red-600'
    },
    { 
      icon: FaClock, 
      label: 'Office Hours', 
      value: 'Mon - Fri: 9:00 AM - 4:00 PM',
      gradient: 'from-pink-500 via-yellow-500 to-orange-500'
    }
  ];

  const socialMedia = [
    { icon: FaFacebook, name: 'Facebook', color: 'text-blue-600', bgHover: 'hover:bg-blue-50', url: '#' },
    { icon: FaTwitter, name: 'Twitter', color: 'text-blue-400', bgHover: 'hover:bg-blue-50', url: '#' },
    { icon: FaInstagram, name: 'Instagram', color: 'text-pink-600', bgHover: 'hover:bg-pink-50', url: '#' },
    { icon: FaLinkedin, name: 'LinkedIn', color: 'text-blue-700', bgHover: 'hover:bg-blue-50', url: '#' }
  ];

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;

    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value)) return 'Only digits, spaces, +, -, () allowed';
        if (value.replace(/\D/g, '').length < 10) return 'Phone must have at least 10 digits';
        return '';
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 3) return 'Subject must be at least 3 characters';
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push('Name is required');
    if (formData.name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Invalid email format');
    if (!formData.phone.trim()) errors.push('Phone is required');
    if (formData.phone.replace(/\D/g, '').length < 10) errors.push('Phone must have at least 10 digits');
    if (!formData.subject.trim()) errors.push('Subject is required');
    if (!formData.message.trim()) errors.push('Message is required');
    if (formData.message.trim().length < 10) errors.push('Message must be at least 10 characters');
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Simulate sending message
    setSuccess('Message sent successfully! We will respond within 24 hours.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validate field in real-time
    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <Layout>
      {/* Hero Section - Enhanced */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 text-white py-32 overflow-hidden particle-bg gradient-animate">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fadeInUp">
          <div className="inline-flex items-center glass-card border-2 border-white/40 px-8 py-4 rounded-full mb-8 shadow-2xl hover:scale-110 transition-transform duration-300">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-white font-black text-lg">Get in Touch</span>
          </div>
          
          <h1 className="hero-title">
            <span className="text-white">Contact </span>
            <span className="text-yellow-300 neon-text">School</span>
          </h1>
          
          <p className="hero-subtitle text-white font-semibold">
            We&apos;d Love to Hear From You
          </p>
        </div>
      </div>

      {/* Contact Info Cards - Enhanced */}
      <div className="bg-gradient-to-b from-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-2xl p-10 text-center hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-8 tilt-effect relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative">
                  <div className={`w-24 h-24 bg-gradient-to-br ${info.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                    <info.icon className="text-white text-4xl" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">{info.label}</h3>
                  <p className="text-gray-700 font-bold text-lg">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visit Campus & Message Form Section - Enhanced */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Visit Our Campus - Enhanced */}
            <div className="space-y-8 stagger-children">
              {/* Campus Visit Card */}
              <div className="group bg-white rounded-3xl shadow-2xl p-10 hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-4">
                <div className="flex items-start mb-8">
                  <div className="text-6xl mr-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">🏫</div>
                  <div>
                    <h3 className="text-3xl font-black text-purple-600 mb-3">Visit Our Campus</h3>
                    <p className="text-gray-600 text-lg font-semibold leading-relaxed">
                      Experience our world-class facilities and meet our dedicated faculty in person.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Location */}
                  <div className="flex items-start group/item">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mr-5 flex-shrink-0 group-hover/item:scale-110 transition-transform">
                      <FaMapMarkerAlt className="text-blue-600 text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-xl mb-2">Location</h4>
                      <p className="text-gray-700 text-lg font-semibold">School Campus, India</p>
                    </div>
                  </div>

                  {/* Visiting Hours */}
                  <div className="flex items-start group/item">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mr-5 flex-shrink-0 group-hover/item:scale-110 transition-transform">
                      <FaClock className="text-green-600 text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-xl mb-2">Visiting Hours</h4>
                      <p className="text-gray-700 text-lg font-semibold">Mon - Fri: 9:00 AM - 4:00 PM</p>
                      <p className="text-gray-700 text-lg font-semibold">Sat: 9:00 AM - 1:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connect With Us Card - Enhanced */}
              <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-4">
                <h3 className="text-3xl font-black text-gray-900 mb-8">Connect With Us</h3>
                <div className="grid grid-cols-2 gap-6">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group/social bg-white border-3 border-gray-100 ${social.bgHover} rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105`}
                    >
                      <social.icon className={`${social.color} text-5xl mx-auto mb-4 group-hover/social:scale-125 group-hover/social:rotate-12 transition-all duration-300`} />
                      <p className="text-gray-700 font-black text-lg">{social.name}</p>
                    </a>
                  ))}
                </div>
              </div>

              {/* Need Immediate Help Card - Enhanced */}
              <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-3xl shadow-2xl p-10 hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 opacity-0 hover:opacity-50 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-start mb-6">
                    <div className="text-5xl mr-4 animate-pulse-slow">⚡</div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 mb-3">Need Immediate Help?</h3>
                      <p className="text-gray-600 text-lg font-semibold">Call us directly for urgent inquiries</p>
                    </div>
                  </div>
                  <a
                    href="tel:+917488770476"
                    className="group flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
                  >
                    <FaPhone className="mr-4 text-2xl group-hover:rotate-12 transition-transform" />
                    +91 7488770476
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Send us a Message Form - Enhanced */}
            <div className="bg-white rounded-3xl shadow-2xl p-12 hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300 rounded-full filter blur-3xl"></div>
              </div>

              <div className="text-center mb-10 relative animate-scaleIn">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-glow">
                  <FaPaperPlane className="text-white text-5xl" />
                </div>
                <h3 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Send us a Message
                </h3>
                <p className="text-gray-600 text-xl font-semibold">Fill out the form and we&apos;ll respond within 24 hours</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 relative">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-500 text-red-700 px-6 py-4 rounded-xl flex items-start animate-shake">
                    <span className="text-xl mr-3">⚠️</span>
                    <p className="font-bold">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border-2 border-green-500 text-green-700 px-6 py-4 rounded-xl flex items-start animate-pulse">
                    <span className="text-xl mr-3">✅</span>
                    <p className="font-bold">{success}</p>
                  </div>
                )}

                {/* Your Name */}
                <div>
                  <label className="label">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.name ? 'border-red-500 border-2' : ''}`}
                    placeholder="Enter your name"
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.email ? 'border-red-500 border-2' : ''}`}
                    placeholder="your.email@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.phone ? 'border-red-500 border-2' : ''}`}
                    placeholder="+91 XXXXXXXXXX"
                  />
                  {fieldErrors.phone && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="label">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.subject ? 'border-red-500 border-2' : ''}`}
                    placeholder="What is this about?"
                  />
                  {fieldErrors.subject && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className={`input-field ${fieldErrors.message ? 'border-red-500 border-2' : ''}`}
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                  {fieldErrors.message && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button - Enhanced */}
                <button
                  type="submit"
                  className="group w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white py-6 rounded-2xl font-black text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <FaPaperPlane className="mr-4 text-2xl group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section - Enhanced */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-6 hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="bg-gradient-to-br from-gray-100 to-purple-100 rounded-2xl h-96 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-8xl mb-6 group-hover:scale-125 transition-transform duration-500">🗺️</div>
                <p className="text-gray-600 font-black text-2xl mb-2">Map will be displayed here</p>
                <p className="text-gray-500 text-xl font-semibold">Google Maps Integration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Enhanced */}
      <div className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-6xl font-black text-gradient mb-6">Frequently Asked Questions</h2>
            <p className="text-2xl text-gray-600 font-semibold">Quick answers to common questions</p>
          </div>

          <div className="space-y-6 stagger-children">
            {[
              { 
                q: 'What are the admission timings?', 
                a: 'Admissions are open from April to June for the upcoming academic year.' 
              },
              { 
                q: 'What documents are required for admission?', 
                a: 'Birth certificate, transfer certificate, previous marksheets, Aadhar card, and passport size photos.' 
              },
              { 
                q: 'Is transportation available?', 
                a: 'Yes, we provide safe and reliable bus service covering major areas of the city.' 
              },
              { 
                q: 'What is the student-teacher ratio?', 
                a: 'We maintain a healthy student-teacher ratio of 20:1 to ensure personalized attention.' 
              }
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border-l-4 border-purple-500"
              >
                <summary className="font-black text-gray-900 text-2xl cursor-pointer flex items-center justify-between group-hover:text-purple-600 transition-colors">
                  <span className="flex items-center">
                    <FaCheckCircle className="text-purple-500 mr-4 text-xl" />
                    {faq.q}
                  </span>
                  <span className="text-purple-600 group-open:rotate-180 transition-transform duration-300 text-3xl">▼</span>
                </summary>
                <p className="text-gray-700 text-xl mt-6 leading-relaxed pl-12 font-semibold">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
