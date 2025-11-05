import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { 
  FaGraduationCap, FaFileAlt, FaPhone, FaSchool, FaCheckCircle,
  FaEnvelope, FaMapMarkerAlt, FaCalendar, FaUser, FaUserGraduate,
  FaPaperPlane, FaComments, FaClock, FaStar, FaRocket, FaArrowRight
} from 'react-icons/fa';

export default function Admission() {
  const [formData, setFormData] = useState({
    studentName: '',
    grade: '',
    parentName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    previousSchool: '',
    message: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const admissionSteps = [
    { 
      step: 1, 
      title: 'Submit Inquiry', 
      desc: 'Fill out the online form',
      icon: FaFileAlt,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500'
    },
    { 
      step: 2, 
      title: 'Receive Confirmation', 
      desc: 'We contact you within 48 hours',
      icon: FaPhone,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500'
    },
    { 
      step: 3, 
      title: 'Visit School', 
      desc: 'Schedule a campus tour',
      icon: FaSchool,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500'
    },
    { 
      step: 4, 
      title: 'Complete Admission', 
      desc: 'Submit documents and fees',
      icon: FaCheckCircle,
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500'
    }
  ];

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;

    switch (name) {
      case 'studentName':
        if (!value.trim()) return 'Student name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'parentName':
        if (!value.trim()) return 'Parent name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'grade':
        if (!value.trim()) return 'Grade is required';
        return '';
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        const age = Math.floor((new Date() - new Date(value)) / 31557600000);
        if (age < 3 || age > 20) return 'Age must be between 3 and 20 years';
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
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Address must be at least 10 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.studentName.trim()) errors.push('Student name is required');
    if (formData.studentName.trim().length < 2) errors.push('Student name must be at least 2 characters');
    if (!formData.parentName.trim()) errors.push('Parent name is required');
    if (!formData.grade.trim()) errors.push('Grade is required');
    if (!formData.dateOfBirth) errors.push('Date of birth is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Invalid email format');
    if (!formData.phone.trim()) errors.push('Phone is required');
    if (formData.phone.replace(/\D/g, '').length < 10) errors.push('Phone must have at least 10 digits');
    if (!formData.address.trim()) errors.push('Address is required');
    if (formData.address.trim().length < 10) errors.push('Address must be at least 10 characters');
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

    // Simulate submission
    setSuccess('Admission inquiry submitted successfully! We will contact you within 48 hours.');
    setFormData({
      studentName: '',
      grade: '',
      parentName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      address: '',
      previousSchool: '',
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
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white py-32 overflow-hidden particle-bg gradient-animate">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fadeInUp">
          <div className="inline-flex items-center glass-card px-8 py-4 rounded-full mb-8 shadow-2xl hover:scale-110 transition-transform duration-300 animate-glow">
            <FaGraduationCap className="text-yellow-300 text-2xl mr-3 animate-bounce-slow" />
            <span className="text-white font-black text-lg">Admissions Open</span>
          </div>
          
          <h1 className="hero-title">
            <span className="text-white">Join </span>
            <span className="text-yellow-300 neon-text">School Family</span>
          </h1>
          
          <p className="hero-subtitle text-white font-semibold">
            Secure Your Child&apos;s Bright Future Today
          </p>
        </div>
      </div>

      {/* Admission Process Section - Enhanced */}
      <div className="bg-gradient-to-b from-white to-purple-50 py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fadeInUp">
            <h2 className="text-6xl font-black text-gradient mb-6">Admission Process</h2>
            <p className="text-2xl text-gray-600 font-semibold">Simple & Hassle-Free in 4 Easy Steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {admissionSteps.map((step, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-2xl p-10 text-center hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-8 relative overflow-hidden tilt-effect"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative">
                  <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                    <step.icon className="text-white text-5xl" />
                  </div>
                  <div className="text-5xl font-black text-purple-600 mb-4 group-hover:scale-110 transition-transform">Step {step.step}</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-lg font-semibold">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admission Inquiry Form Section - Enhanced */}
      <div className="bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-12 hover:shadow-purple-500/30 transition-all duration-500 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300 rounded-full filter blur-3xl"></div>
            </div>

            {/* Form Header - Enhanced */}
            <div className="text-center mb-12 relative animate-scaleIn">
              <div className="w-28 h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-glow">
                <FaUserGraduate className="text-white text-6xl" />
              </div>
              <h3 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Admission Inquiry Form
              </h3>
              <p className="text-gray-600 text-xl font-semibold">Fill in the details and we&apos;ll get back to you soon!</p>
            </div>

            {/* Form - Enhanced */}
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

              <div className="grid md:grid-cols-2 gap-8">
                {/* Student Name */}
                <div className="group">
                  <label className="label flex items-center">
                    <FaGraduationCap className="text-blue-500 mr-2 text-xl group-hover:scale-110 transition-transform" />
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.studentName ? 'border-red-500 border-2' : ''}`}
                    placeholder="Enter student's full name"
                  />
                  {fieldErrors.studentName && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.studentName}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="group">
                  <label className="label flex items-center">
                    <FaCalendar className="text-green-500 mr-2 text-xl group-hover:scale-110 transition-transform" />
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.dateOfBirth ? 'border-red-500 border-2' : ''}`}
                  />
                  {fieldErrors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.dateOfBirth}
                    </p>
                  )}
                </div>

                {/* Grade/Class */}
                <div className="group">
                  <label className="label flex items-center">
                    <FaUserGraduate className="text-purple-500 mr-2 text-xl group-hover:scale-110 transition-transform" />
                    Grade/Class Applying For *
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.grade ? 'border-red-500 border-2' : ''}`}
                  >
                    <option value="">Select Grade</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Class {grade}</option>
                    ))}
                  </select>
                  {fieldErrors.grade && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.grade}
                    </p>
                  )}
                </div>

                {/* Parent/Guardian Name */}
                <div className="group">
                  <label className="label flex items-center">
                    <FaUser className="text-pink-500 mr-2 text-xl group-hover:scale-110 transition-transform" />
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.parentName ? 'border-red-500 border-2' : ''}`}
                    placeholder="Enter parent's name"
                  />
                  {fieldErrors.parentName && (
                    <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                      <span className="mr-1">⚠️</span>
                      {fieldErrors.parentName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="group">
                  <label className="label flex items-center">
                    <FaEnvelope className="text-orange-500 mr-2 text-xl group-hover:scale-110 transition-transform" />
                    Email Address *
                  </label>
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
                <div className="group">
                  <label className="label flex items-center">
                    <FaPhone className="text-teal-500 mr-2 text-xl group-hover:scale-110 transition-transform" />
                    Phone Number *
                  </label>
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
              </div>

              {/* Address */}
              <div className="group">
                <label className="label flex items-center">
                  <FaMapMarkerAlt className="text-red-500 mr-2 text-xl group-hover:scale-110 transition-transform" />
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`input-field ${fieldErrors.address ? 'border-red-500 border-2' : ''}`}
                  placeholder="Complete address"
                />
                {fieldErrors.address && (
                  <p className="text-red-500 text-sm mt-2 font-semibold flex items-center">
                    <span className="mr-1">⚠️</span>
                    {fieldErrors.address}
                  </p>
                )}
              </div>

              {/* Previous School */}
              <div className="group">
                <label className="label flex items-center">
                  <FaSchool className="text-indigo-500 mr-2 text-xl group-hover:scale-110 transition-transform" />
                  Previous School (if any)
                </label>
                <input
                  type="text"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Name of previous school"
                />
              </div>

              {/* Additional Message */}
              <div className="group">
                <label className="label">Additional Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="input-field"
                  placeholder="Any additional information..."
                ></textarea>
              </div>

              {/* Submit Button - Enhanced */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-white py-6 rounded-2xl font-black text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
              >
                <FaPaperPlane className="mr-4 text-2xl group-hover:translate-x-[-4px] transition-transform" />
                Submit Admission Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Need Help Section - Enhanced */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-24 relative overflow-hidden gradient-animate">
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full filter blur-3xl top-10 left-10 animate-blob"></div>
          <div className="absolute w-96 h-96 bg-white/10 rounded-full filter blur-3xl bottom-10 right-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center hover:shadow-purple-500/50 transition-all duration-500 hover:-translate-y-4">
            <div className="w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <FaComments className="text-purple-600 text-5xl animate-bounce-slow" />
            </div>
            
            <h3 className="text-5xl font-black text-gray-900 mb-4">
              Need Help with Admission?
            </h3>
            <p className="text-gray-600 text-2xl mb-10 font-semibold">
              Our admission team is here to assist you!
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <a
                href="tel:+917488770476"
                className="group inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300"
              >
                <FaPhone className="mr-4 text-2xl group-hover:rotate-12 transition-transform" />
                +91 7488770476
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-gray-100 text-gray-800 px-12 py-5 rounded-2xl font-black text-xl hover:bg-gray-200 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
              >
                Contact Us
                <FaArrowRight className="ml-3" />
              </Link>
            </div>

            <div className="inline-flex items-center bg-green-50 text-green-700 px-8 py-4 rounded-full border-2 border-green-200">
              <FaCheckCircle className="text-green-500 mr-3 text-2xl" />
              <span className="font-bold text-lg">
                <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 4:00 PM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Section - Enhanced */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-6xl font-black text-gradient mb-6">Required Documents</h2>
            <p className="text-2xl text-gray-600 font-semibold">Please keep these documents ready for admission</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {[
              { icon: '📄', title: 'Birth Certificate', desc: 'Original and photocopy', gradient: 'from-blue-500 to-cyan-500' },
              { icon: '📝', title: 'Transfer Certificate', desc: 'From previous school (if applicable)', gradient: 'from-purple-500 to-pink-500' },
              { icon: '📸', title: 'Passport Size Photos', desc: '4 recent photographs', gradient: 'from-green-500 to-emerald-500' },
              { icon: '🆔', title: 'Aadhar Card', desc: 'Student and parent Aadhar', gradient: 'from-orange-500 to-red-500' },
              { icon: '📋', title: 'Medical Certificate', desc: 'Fitness and vaccination records', gradient: 'from-pink-500 to-rose-500' },
              { icon: '📊', title: 'Previous Marksheets', desc: 'Last examination results', gradient: 'from-indigo-500 to-purple-500' }
            ].map((doc, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-6 text-center border-t-4 border-transparent hover:border-purple-500"
              >
                <div className="text-7xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{doc.icon}</div>
                <h4 className="text-2xl font-black text-gray-900 mb-3">{doc.title}</h4>
                <p className="text-gray-600 text-lg font-semibold">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Structure Teaser - Enhanced */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-purple-200 hover:border-purple-400 hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-50"></div>
            
            <div className="relative">
              <div className="text-6xl mb-8">💰</div>
              <h3 className="text-5xl font-black text-gray-900 mb-6">
                Affordable Fee Structure
              </h3>
              <p className="text-gray-700 text-2xl mb-10 leading-relaxed">
                We believe quality education should be accessible to all. Contact us for detailed fee information.
              </p>
              <Link
                href="/contact"
                className="group inline-flex items-center bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-14 py-5 rounded-full font-black text-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300"
              >
                Get Fee Details
                <FaPaperPlane className="ml-4 text-2xl group-hover:translate-x-2 group-hover:translate-y-[-2px] transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
