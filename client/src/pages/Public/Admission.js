import React, { useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUserGraduate, FaCalendar, FaSchool, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

const Admission = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    dateOfBirth: '',
    grade: '',
    parentName: '',
    email: '',
    phone: '',
    address: '',
    previousSchool: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const admissionSteps = [
    { step: 1, title: 'Submit Inquiry', desc: 'Fill out the online form', icon: '📝', color: 'from-blue-500 to-blue-700' },
    { step: 2, title: 'Receive Confirmation', desc: 'We contact you within 48 hours', icon: '📞', color: 'from-green-500 to-green-700' },
    { step: 3, title: 'Visit School', desc: 'Schedule a campus tour', icon: '🏫', color: 'from-purple-500 to-purple-700' },
    { step: 4, title: 'Complete Admission', desc: 'Submit documents and fees', icon: '✅', color: 'from-pink-500 to-pink-700' }
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
      await axios.post('/api/public/admission-inquiry', formData);
      toast.success('Your admission inquiry has been submitted successfully!');
      setFormData({
        studentName: '',
        dateOfBirth: '',
        grade: '',
        parentName: '',
        email: '',
        phone: '',
        address: '',
        previousSchool: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <span className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold animate-pulse-slow">
                🎓 Admissions Open
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              <span className="block">Join</span>
              <span className="block text-yellow-300">DAV School Family</span>
            </h1>
            <p className="text-2xl md:text-3xl text-purple-100 font-light">
              Secure Your Child's Bright Future Today
            </p>
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-5xl font-extrabold mb-4">
              <span className="text-gradient">Admission Process</span>
            </h2>
            <p className="text-xl text-gray-600">Simple & Hassle-Free in 4 Easy Steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {admissionSteps.map((item, index) => (
              <div 
                key={index}
                className="stat-card text-center group animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  {item.icon}
                </div>
                <div className="text-3xl font-extrabold text-gradient mb-2">Step {item.step}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Form Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="modern-card p-10 animate-fadeIn">
            <div className="text-center mb-10">
              <div className="inline-block w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-2xl animate-pulse-slow">
                <FaUserGraduate className="text-white text-4xl" />
              </div>
              <h2 className="text-4xl font-extrabold mb-3">
                <span className="text-gradient">Admission Inquiry Form</span>
              </h2>
              <p className="text-gray-600 text-lg">Fill in the details and we'll get back to you soon!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <FaUserGraduate className="inline mr-2 text-blue-500" />
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    className="input"
                    placeholder="Enter student's full name"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <FaCalendar className="inline mr-2 text-green-500" />
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <FaSchool className="inline mr-2 text-purple-500" />
                    Grade/Class Applying For *
                  </label>
                  <select
                    name="grade"
                    className="input"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Grade</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                      <option key={grade} value={grade}>
                        Class {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    <FaUser className="inline mr-2 text-pink-500" />
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    className="input"
                    placeholder="Enter parent's name"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <FaEnvelope className="inline mr-2 text-orange-500" />
                    Email Address *
                  </label>
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
                  <label className="label">
                    <FaPhone className="inline mr-2 text-teal-500" />
                    Phone Number *
                  </label>
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

                <div className="md:col-span-2">
                  <label className="label">
                    <FaMapMarkerAlt className="inline mr-2 text-red-500" />
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="input"
                    placeholder="Complete address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    <FaSchool className="inline mr-2 text-indigo-500" />
                    Previous School (if any)
                  </label>
                  <input
                    type="text"
                    name="previousSchool"
                    className="input"
                    placeholder="Name of previous school"
                    value={formData.previousSchool}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    Additional Message
                  </label>
                  <textarea
                    name="message"
                    className="input"
                    rows="4"
                    placeholder="Any additional information..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
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
                    Submit Admission Inquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Help Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="modern-card text-center p-10">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Need Help with Admission?</h2>
            <p className="text-lg mb-6 text-gray-700 font-semibold">
              Our admission team is here to assist you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+917488770476" className="btn bg-white text-purple-600 hover:bg-yellow-300 text-xl px-8 py-4 inline-flex items-center justify-center shadow-xl">
                <FaPhone className="mr-3" />
                +91 7488770476
              </a>
              <a href="mailto:info@davschool.edu.in" className="btn glass border-2 border-white/30 text-xl px-8 py-4 inline-flex items-center justify-center">
                <FaEnvelope className="mr-3" />
                Email Us
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-700 font-semibold">
              <FaCheckCircle className="inline mr-2 text-green-600" />
              Office Hours: Monday - Friday, 9:00 AM - 4:00 PM
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Admission;
