import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUpload, FaFileAlt, FaBook, FaVideo, FaFilePdf, FaLink,
  FaPlus, FaTimes, FaSave, FaSpinner, FaTrash, FaEye,
  FaDownload, FaClipboard, FaChalkboard, FaBookOpen
} from 'react-icons/fa';

export default function UploadContent() {
  const { token } = useAuth();
  const [contents, setContents] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterClass, setFilterClass] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'document',
    category: 'lesson',
    classId: '',
    subjectName: '',
    externalLink: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'link'

  const fetchMyClasses = useCallback(async () => {
    try {
      const response = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const schedule = response.data.data?.todaySchedule || [];
      
      // Get unique classes
      const uniqueClasses = [];
      const seen = new Set();
      schedule.forEach(item => {
        if (item.className && !seen.has(item.className)) {
          uniqueClasses.push(item);
          seen.add(item.className);
        }
      });
      
      setMyClasses(uniqueClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load your classes');
    }
  }, [token]);

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/lms-content', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMyClasses();
      fetchContents();
    }
  }, [token, fetchMyClasses, fetchContents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.contentType) errors.push('Content type is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.classId) errors.push('Class is required');
    if (!formData.subjectName.trim()) errors.push('Subject is required');
    
    return errors;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/staff/upload-file', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.fileUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('. '));
      return;
    }

    // Validate upload method
    if (uploadMethod === 'file' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (uploadMethod === 'link' && !formData.externalLink.trim()) {
      toast.error('Please enter a link/URL');
      return;
    }

    setSubmitting(true);

    try {
      let finalLink = formData.externalLink;

      // Upload file if file method is selected
      if (uploadMethod === 'file' && selectedFile) {
        toast('Uploading file...', { icon: '📤' });
        finalLink = await uploadFile();
      }

      // Convert tags string to array
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      
      await axios.post('/api/staff/lms-content', {
        ...formData,
        externalLink: finalLink,
        tags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Content uploaded successfully!');
      setShowModal(false);
      resetForm();
      fetchContents();
    } catch (error) {
      console.error('Error uploading content:', error);
      toast.error(error.response?.data?.message || 'Failed to upload content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await axios.delete(`/api/staff/lms-content/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Content deleted successfully!');
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error(error.response?.data?.message || 'Failed to delete content');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contentType: 'document',
      category: 'lesson',
      classId: '',
      subjectName: '',
      externalLink: '',
      tags: ''
    });
    setSelectedFile(null);
    setUploadMethod('file');
  };

  const getContentIcon = (type) => {
    const icons = {
      video: FaVideo,
      document: FaFileAlt,
      pdf: FaFilePdf,
      link: FaLink,
      presentation: FaBook,
      assignment: FaClipboard,
      other: FaFileAlt
    };
    return icons[type] || FaFileAlt;
  };

  const getContentColor = (type) => {
    const colors = {
      video: 'from-red-500 to-rose-500',
      document: 'from-blue-500 to-cyan-500',
      pdf: 'from-orange-500 to-red-500',
      link: 'from-green-500 to-emerald-500',
      presentation: 'from-purple-500 to-pink-500',
      assignment: 'from-yellow-500 to-orange-500',
      other: 'from-gray-500 to-slate-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      lesson: { color: 'bg-blue-100 text-blue-700', label: 'Lesson' },
      assignment: { color: 'bg-yellow-100 text-yellow-700', label: 'Assignment' },
      study_material: { color: 'bg-green-100 text-green-700', label: 'Study Material' },
      reference: { color: 'bg-purple-100 text-purple-700', label: 'Reference' },
      exam_preparation: { color: 'bg-orange-100 text-orange-700', label: 'Exam Prep' }
    };
    return badges[category] || { color: 'bg-gray-100 text-gray-700', label: category };
  };

  // Filter content
  const filteredContents = contents.filter(content => {
    const classMatch = filterClass === 'all' || content.className === filterClass;
    const typeMatch = filterType === 'all' || content.contentType === filterType;
    return classMatch && typeMatch;
  });

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <FaSpinner className="text-6xl text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-600">Loading content...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaUpload className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Learning Content
                  </h1>
                  <p className="text-gray-600 font-semibold">Upload and manage class-wise study materials</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus />
                Upload Content
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mt-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Filter by Class:</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none font-semibold"
                >
                  <option value="all">All Classes</option>
                  {myClasses.map((cls, idx) => (
                    <option key={idx} value={cls.className}>{cls.className}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Filter by Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none font-semibold"
                >
                  <option value="all">All Types</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                  <option value="pdf">PDFs</option>
                  <option value="link">Links</option>
                  <option value="presentation">Presentations</option>
                  <option value="assignment">Assignments</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaBook className="text-3xl" />
                <span className="text-3xl font-black">{contents.length}</span>
              </div>
              <p className="font-bold">Total Content</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaChalkboard className="text-3xl" />
                <span className="text-3xl font-black">{myClasses.length}</span>
              </div>
              <p className="font-bold">Your Classes</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaVideo className="text-3xl" />
                <span className="text-3xl font-black">{contents.filter(c => c.contentType === 'video').length}</span>
              </div>
              <p className="font-bold">Videos</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaFilePdf className="text-3xl" />
                <span className="text-3xl font-black">{contents.filter(c => c.contentType === 'pdf' || c.contentType === 'document').length}</span>
              </div>
              <p className="font-bold">Documents</p>
            </div>
          </div>

          {/* Content List */}
          {filteredContents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaBookOpen className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Content Found</h3>
              <p className="text-gray-600 mb-6">
                {contents.length === 0 
                  ? 'Start by uploading your first study material' 
                  : 'No content matches your filters'}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus />
                Upload First Content
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((content) => {
                const ContentIcon = getContentIcon(content.contentType);
                const categoryBadge = getCategoryBadge(content.category);
                
                return (
                  <div
                    key={content._id}
                    className={`group bg-gradient-to-br ${getContentColor(content.contentType)} rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-all cursor-pointer relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <ContentIcon className="text-3xl" />
                        </div>
                        <button
                          onClick={() => handleDelete(content._id)}
                          className="w-10 h-10 bg-white/20 hover:bg-red-500 rounded-lg flex items-center justify-center transition-all"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <h3 className="text-xl font-black mb-2 line-clamp-2">{content.title}</h3>
                      <p className="text-sm opacity-90 mb-3 line-clamp-2">{content.description || 'No description'}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 ${categoryBadge.color} rounded-full text-xs font-bold`}>
                          {categoryBadge.label}
                        </span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                          {content.className}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/20">
                        <span className="text-xs font-semibold opacity-90">{content.subjectName}</span>
                        <span className="text-xs font-semibold">{new Date(content.createdAt).toLocaleDateString()}</span>
                      </div>

                      {content.externalLink && (
                        <a
                          href={content.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center gap-2 text-sm font-bold hover:underline bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {content.contentType === 'link' ? <FaLink /> : <FaDownload />}
                          {content.contentType === 'link' ? 'Open Link' : 'View/Download'}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 border-4 border-purple-200 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-purple-600">Upload Learning Content</h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Content Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                    placeholder="e.g., Chapter 5: Quadratic Equations"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                    rows="3"
                    placeholder="Brief description of the content"
                  />
                </div>

                {/* Class and Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="classId"
                      value={formData.classId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      required
                    >
                      <option value="">Select Class</option>
                      {myClasses.map((cls, idx) => (
                        <option key={idx} value={cls.className}>{cls.className}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">⚠️ Only this class can see this content</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subjectName"
                      value={formData.subjectName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                </div>

                {/* Content Type and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Content Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="contentType"
                      value={formData.contentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      required
                    >
                      <option value="document">Document</option>
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="presentation">Presentation</option>
                      <option value="link">External Link</option>
                      <option value="assignment">Assignment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      required
                    >
                      <option value="lesson">Lesson</option>
                      <option value="assignment">Assignment</option>
                      <option value="study_material">Study Material</option>
                      <option value="reference">Reference</option>
                      <option value="exam_preparation">Exam Preparation</option>
                    </select>
                  </div>
                </div>

                {/* Upload Method Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    How do you want to add content? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadMethod"
                        value="file"
                        checked={uploadMethod === 'file'}
                        onChange={(e) => setUploadMethod(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="font-semibold">📤 Upload File from Computer</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadMethod"
                        value="link"
                        checked={uploadMethod === 'link'}
                        onChange={(e) => setUploadMethod(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="font-semibold">🔗 Provide External Link</span>
                    </label>
                  </div>
                </div>

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Select File <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mp3,.zip"
                    />
                    {selectedFile && (
                      <p className="text-sm text-green-600 mt-2 font-semibold">
                        ✅ Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: PDF, DOC, PPT, Images, Videos, ZIP (Max 50MB)
                    </p>
                  </div>
                )}

                {/* External Link */}
                {uploadMethod === 'link' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Content Link/URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="externalLink"
                      value={formData.externalLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                      placeholder="https://youtube.com/... or https://drive.google.com/..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter URL to your content (YouTube, Google Drive, Dropbox, OneDrive, etc.)
                    </p>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags (Optional)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                    placeholder="algebra, equations, chapter-5 (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                {/* Info Box */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <p className="font-bold text-purple-900 mb-1">Class-Wise Access Control</p>
                      <p className="text-sm text-purple-700">
                        Only students enrolled in <strong>{formData.classId || 'the selected class'}</strong> will be able to view this content.
                        Other classes won&apos;t see it in their LMS portal.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Upload Content
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

