import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FaBook, FaPlus, FaVideo, FaFilePdf, FaFileWord, FaLink, FaUpload, FaEye, FaEdit, FaTrash, FaDownload, FaUsers, FaTimes } from 'react-icons/fa';

const LMSManagement = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const contentTypes = [
    { id: 'all', name: 'All Content', icon: '📚', count: 12, color: 'from-purple-500 to-purple-700' },
    { id: 'video', name: 'Videos', icon: '🎥', count: 4, color: 'from-red-500 to-red-700' },
    { id: 'document', name: 'Documents', icon: '📄', count: 5, color: 'from-blue-500 to-blue-700' },
    { id: 'assignment', name: 'Assignments', icon: '📝', count: 3, color: 'from-green-500 to-green-700' }
  ];

  const stats = [
    { label: 'Total Content', value: '12', icon: '📚', color: 'from-blue-500 to-blue-700' },
    { label: 'Total Views', value: '245', icon: '👁️', color: 'from-green-500 to-green-700' },
    { label: 'Submissions', value: '18', icon: '📥', color: 'from-purple-500 to-purple-700' },
    { label: 'Pending Review', value: '5', icon: '⏳', color: 'from-yellow-500 to-yellow-700' }
  ];

  const content = [
    { 
      id: 1, 
      title: 'Introduction to Algebra', 
      type: 'video', 
      class: '10-A', 
      subject: 'Mathematics',
      views: 45, 
      date: '2024-10-28',
      status: 'Published',
      icon: FaVideo,
      color: 'from-red-400 to-red-600'
    },
    { 
      id: 2, 
      title: 'Chapter 5 - Chemical Reactions', 
      type: 'document', 
      class: '10-A', 
      subject: 'Science',
      views: 38, 
      date: '2024-10-25',
      status: 'Published',
      icon: FaFilePdf,
      color: 'from-blue-400 to-blue-600'
    },
    { 
      id: 3, 
      title: 'Assignment - Quadratic Equations', 
      type: 'assignment', 
      class: '10-B', 
      subject: 'Mathematics',
      views: 32, 
      date: '2024-10-20',
      status: 'Active',
      submissions: 18,
      icon: FaFileWord,
      color: 'from-green-400 to-green-600'
    },
    { 
      id: 4, 
      title: 'Physics Notes - Motion', 
      type: 'document', 
      class: '10-C', 
      subject: 'Physics',
      views: 28, 
      date: '2024-10-18',
      status: 'Published',
      icon: FaFilePdf,
      color: 'from-purple-400 to-purple-600'
    }
  ];

  const filteredContent = selectedType === 'all' 
    ? content 
    : content.filter(c => c.type === selectedType);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient mb-2">LMS Management</h1>
            <p className="text-gray-600 text-lg">Upload and manage learning materials</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="mt-4 md:mt-0 btn btn-primary flex items-center shadow-xl"
          >
            <FaPlus className="mr-2" />
            Upload New Content
          </button>
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

        {/* Content Type Tabs */}
        <div className="flex gap-4 overflow-x-auto animate-fadeIn" style={{animationDelay: '0.2s'}}>
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap flex items-center space-x-3 ${
                selectedType === type.id
                  ? `bg-gradient-to-r ${type.color} text-white shadow-xl scale-105`
                  : 'bg-white text-gray-700 shadow hover:shadow-xl hover:scale-105'
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <div className="text-left">
                <div>{type.name}</div>
                <div className="text-xs opacity-80">{type.count} items</div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
          {filteredContent.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item, index) => (
                <div 
                  key={item.id}
                  className="modern-card group hover-lift animate-fadeInUp"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  {/* Content Header */}
                  <div className={`h-32 rounded-t-2xl bg-gradient-to-br ${item.color} p-6 flex items-center justify-between -m-8 mb-6`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-bold">
                          {item.class}
                        </span>
                        <span className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-bold">
                          {item.subject}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                    <div className="text-5xl text-white/80 group-hover:scale-125 transition-transform">
                      {contentTypes.find(t => t.id === item.type)?.icon}
                    </div>
                  </div>

                  {/* Content Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <FaEye className="mr-2 text-blue-500" />
                        Views:
                      </span>
                      <span className="font-bold text-gray-800">{item.views}</span>
                    </div>
                    {item.submissions && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <FaUsers className="mr-2 text-green-500" />
                          Submissions:
                        </span>
                        <span className="font-bold text-green-600">{item.submissions}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="font-semibold text-gray-700">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`badge ${item.status === 'Published' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                    <button className="btn btn-info text-xs py-2">
                      <FaEye className="mx-auto" />
                    </button>
                    <button className="btn btn-success text-xs py-2">
                      <FaEdit className="mx-auto" />
                    </button>
                    <button className="btn btn-danger text-xs py-2">
                      <FaTrash className="mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="modern-card text-center py-16">
              <div className="text-8xl mb-6 animate-bounce-slow">📚</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Content Found</h3>
              <p className="text-gray-600 mb-6">Start by uploading your first learning material</p>
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                <FaPlus className="mr-2" />
                Upload First Content
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeInUp">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <FaUpload className="text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold">Upload Learning Material</h2>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="label">Content Title *</label>
                  <input type="text" className="input" placeholder="Enter content title" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Class *</label>
                    <select className="input">
                      <option>Class 10-A</option>
                      <option>Class 10-B</option>
                      <option>Class 10-C</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Subject *</label>
                    <select className="input">
                      <option>Mathematics</option>
                      <option>Science</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Content Type *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: FaVideo, label: 'Video', color: 'from-red-400 to-red-600' },
                      { icon: FaFilePdf, label: 'PDF', color: 'from-blue-400 to-blue-600' },
                      { icon: FaFileWord, label: 'Document', color: 'from-green-400 to-green-600' },
                      { icon: FaLink, label: 'Link', color: 'from-purple-400 to-purple-600' }
                    ].map((type, i) => (
                      <button
                        key={i}
                        className={`p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all hover:scale-105 hover:shadow-lg`}
                      >
                        <type.icon className={`text-3xl mx-auto mb-2 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} />
                        <p className="text-sm font-semibold text-gray-700">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Upload File *</label>
                  <div className="border-4 border-dashed border-purple-300 rounded-2xl p-12 text-center bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-500 transition-all cursor-pointer">
                    <FaUpload className="text-6xl mx-auto mb-4 text-purple-400" />
                    <p className="text-gray-700 font-semibold mb-2">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm">PDF, DOC, Video files (Max 50MB)</p>
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea className="input" rows="4" placeholder="Add description..."></textarea>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 btn btn-primary py-4 flex items-center justify-center">
                    <FaUpload className="mr-2" />
                    Upload Content
                  </button>
                  <button onClick={() => setShowUploadModal(false)} className="flex-1 btn btn-secondary py-4">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LMSManagement;
