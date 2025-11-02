import React, { useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaCamera, FaMapMarkerAlt, FaCheck, FaTimes, FaClipboardCheck, FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const MarkAttendance = () => {
  const [selectedTab, setSelectedTab] = useState('self'); // 'self' or 'students'
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef(null);

  // Get current location
  const getLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
          setGettingLocation(false);
          toast.success('Location captured successfully! 📍');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location. Please enable GPS.');
          setGettingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setGettingLocation(false);
    }
  };

  // Handle photo capture/upload
  const handlePhotoCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result);
        toast.success('Photo captured! 📸');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!capturedPhoto) {
      toast.error('Please capture your photo');
      return;
    }
    if (!location) {
      toast.error('Please enable GPS location');
      return;
    }

    toast.success('Attendance marked successfully! ✅');
  };

  const tabs = [
    { id: 'self', name: 'My Attendance', icon: '🙋‍♂️', color: 'from-blue-500 to-blue-700' },
    { id: 'students', name: 'Mark Student Attendance', icon: '👨‍🎓', color: 'from-purple-500 to-purple-700' }
  ];

  const stats = [
    { label: 'Present Days', value: '22', icon: '✅', color: 'from-green-500 to-green-700' },
    { label: 'Absent Days', value: '2', icon: '❌', color: 'from-red-500 to-red-700' },
    { label: 'This Month', value: '92%', icon: '📊', color: 'from-blue-500 to-blue-700' },
    { label: 'Total Days', value: '24', icon: '📅', color: 'from-purple-500 to-purple-700' }
  ];

  const studentList = [
    { id: 1, name: 'Sarah Student', rollNo: '001', status: null },
    { id: 2, name: 'John Doe', rollNo: '002', status: null },
    { id: 3, name: 'Emma Wilson', rollNo: '003', status: null },
    { id: 4, name: 'Michael Brown', rollNo: '004', status: null },
    { id: 5, name: 'Sophia Davis', rollNo: '005', status: null }
  ];

  const [studentAttendance, setStudentAttendance] = useState(studentList);

  const markStudent = (id, status) => {
    setStudentAttendance(prev =>
      prev.map(student =>
        student.id === id ? { ...student, status } : student
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">Mark Attendance</h1>
            <p className="text-gray-600 text-lg">Record attendance with GPS & Photo verification</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="px-4 py-2 rounded-xl bg-green-100 text-green-700 font-semibold flex items-center">
              <FaClock className="mr-2" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="stat-card group"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</p>
                  <p className="text-4xl font-extrabold text-gradient">{stat.value}</p>
                </div>
                <div className="text-5xl group-hover:scale-125 transition-transform">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center space-x-3 ${
                selectedTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-xl scale-105`
                  : 'bg-white text-gray-700 shadow hover:shadow-xl hover:scale-105'
              }`}
            >
              <span className="text-3xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Self Attendance Tab */}
        {selectedTab === 'self' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* Camera Section */}
            <div className="modern-card p-8">
              <div className="text-center mb-6">
                <div className="inline-block w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-2xl animate-pulse-slow">
                  <FaCamera className="text-white text-4xl" />
                </div>
                <h2 className="text-3xl font-bold text-gradient mb-2">Capture Your Photo</h2>
                <p className="text-gray-600">Take a selfie for attendance verification</p>
              </div>

              <div className="mb-6">
                {capturedPhoto ? (
                  <div className="relative group">
                    <img 
                      src={capturedPhoto} 
                      alt="Captured" 
                      className="w-full h-80 object-cover rounded-2xl shadow-xl"
                    />
                    <button
                      onClick={() => setCapturedPhoto(null)}
                      className="absolute top-4 right-4 btn btn-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes className="mr-2" /> Retake
                    </button>
                    <div className="absolute bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-xl font-bold flex items-center shadow-lg">
                      <FaCheckCircle className="mr-2" /> Photo Captured
                    </div>
                  </div>
                ) : (
                  <div className="border-4 border-dashed border-purple-300 rounded-2xl p-12 text-center bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-500 transition-all cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-8xl mb-4 animate-bounce-slow">📸</div>
                    <p className="text-gray-700 font-semibold mb-2">Click to capture photo</p>
                    <p className="text-gray-500 text-sm">or use your camera</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full btn btn-primary flex items-center justify-center py-4"
              >
                <FaCamera className="mr-2" />
                {capturedPhoto ? 'Retake Photo' : 'Capture Photo'}
              </button>
            </div>

            {/* GPS Location Section */}
            <div className="modern-card p-8">
              <div className="text-center mb-6">
                <div className="inline-block w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-4 shadow-2xl animate-pulse-slow">
                  <FaMapMarkerAlt className="text-white text-4xl" />
                </div>
                <h2 className="text-3xl font-bold text-gradient mb-2">GPS Location</h2>
                <p className="text-gray-600">Verify your location for attendance</p>
              </div>

              <div className="mb-6">
                {location ? (
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border-4 border-green-300">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-xl">
                        <FaCheckCircle className="text-white text-3xl" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-green-700 text-center mb-4">Location Captured!</h3>
                    <div className="space-y-2 text-center">
                      <p className="text-gray-700">
                        <span className="font-semibold">Latitude:</span> {location.latitude}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Longitude:</span> {location.longitude}
                      </p>
                      <p className="text-sm text-gray-600 mt-4">
                        📍 {location.address}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-4 border-dashed border-green-300 rounded-2xl p-12 text-center bg-gradient-to-br from-green-50 to-teal-50">
                    <div className="text-8xl mb-4 animate-float">📍</div>
                    <p className="text-gray-700 font-semibold mb-2">GPS not enabled</p>
                    <p className="text-gray-500 text-sm">Click below to get your location</p>
                  </div>
                )}
              </div>

              <button
                onClick={getLocation}
                disabled={gettingLocation}
                className="w-full btn btn-success flex items-center justify-center py-4"
              >
                {gettingLocation ? (
                  <div className="loader border-white"></div>
                ) : (
                  <>
                    <FaMapMarkerAlt className="mr-2" />
                    {location ? 'Refresh Location' : 'Get GPS Location'}
                  </>
                )}
              </button>

              {/* Submit Attendance */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                <h3 className="font-bold text-gray-800 mb-4 text-center">Ready to Mark?</h3>
                <button
                  onClick={handleSubmitAttendance}
                  disabled={!capturedPhoto || !location}
                  className={`w-full btn py-4 flex items-center justify-center ${
                    capturedPhoto && location ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCheckCircle className="mr-2" />
                  Mark My Attendance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Attendance Tab */}
        {selectedTab === 'students' && (
          <div className="modern-card p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gradient mb-2">Class Attendance</h2>
                <p className="text-gray-600">Mark attendance for Class 10-A</p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-success flex items-center">
                  <FaCheck className="mr-2" /> Mark All Present
                </button>
                <button className="btn btn-primary flex items-center">
                  <FaClipboardCheck className="mr-2" /> Submit
                </button>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-4">
              {studentAttendance.map((student, index) => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg transition-all animate-fadeInUp"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{student.name}</h3>
                      <p className="text-sm text-gray-600">Roll No: {student.rollNo}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => markStudent(student.id, 'present')}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        student.status === 'present'
                          ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg scale-110'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      <FaCheck className="inline mr-2" /> Present
                    </button>
                    <button
                      onClick={() => markStudent(student.id, 'absent')}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        student.status === 'absent'
                          ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg scale-110'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <FaTimes className="inline mr-2" /> Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 text-center">
                <div className="text-4xl font-extrabold text-green-600 mb-1">
                  {studentAttendance.filter(s => s.status === 'present').length}
                </div>
                <div className="text-sm text-green-700 font-semibold">Present</div>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 text-center">
                <div className="text-4xl font-extrabold text-red-600 mb-1">
                  {studentAttendance.filter(s => s.status === 'absent').length}
                </div>
                <div className="text-sm text-red-700 font-semibold">Absent</div>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 text-center">
                <div className="text-4xl font-extrabold text-gray-600 mb-1">
                  {studentAttendance.filter(s => s.status === null).length}
                </div>
                <div className="text-sm text-gray-700 font-semibold">Not Marked</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarkAttendance;
