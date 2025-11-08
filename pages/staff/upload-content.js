import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUpload, FaFileAlt, FaBook, FaVideo, FaFilePdf, FaLink,
  FaPlus, FaTimes, FaSave, FaSpinner, FaTrash, FaEye,
  FaDownload, FaClipboard, FaChalkboard, FaBookOpen,
  FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaFilter
} from 'react-icons/fa';

export default function UploadContent() {
  const { token } = useAuth();
  const [contents, setContents] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterClass, setFilterClass] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [fieldErrors, setFieldErrors] = useState({});
  
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const contentTypes = useMemo(() => [
    { value: 'document', label: 'Document', icon: FaFileAlt, accept: '.doc,.docx,.txt,.rtf' },
    { value: 'pdf', label: 'PDF', icon: FaFilePdf, accept: '.pdf' },
    { value: 'video', label: 'Video', icon: FaVideo, accept: '.mp4,.avi,.mkv,.mov' },
    { value: 'presentation', label: 'Presentation', icon: FaBook, accept: '.ppt,.pptx' },
    { value: 'assignment', label: 'Assignment', icon: FaClipboard, accept: '.pdf,.doc,.docx' },
    { value: 'link', label: 'External Link', icon: FaLink, accept: '' },
    { value: 'other', label: 'Other', icon: FaFileAlt, accept: '.zip,.rar,.jpg,.jpeg,.png' }
  ], []);

  const categories = useMemo(() => [
    { value: 'lesson', label: 'Lesson', description: 'Teaching material for lessons' },
    { value: 'assignment', label: 'Assignment', description: 'Homework or tasks for students' },
    { value: 'study_material', label: 'Study Material', description: 'Additional learning resources' },
    { value: 'reference', label: 'Reference', description: 'Reference books and guides' },
    { value: 'exam_preparation', label: 'Exam Preparation', description: 'Practice tests and exam guides' }
  ], []);

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

  const fetchMySubjects = useCallback(async () => {
    try {
      const response = await axios.get('/api/staff/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMySubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
      fetchMySubjects();
      fetchContents();
    }
  }, [token, fetchMyClasses, fetchMySubjects, fetchContents]);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 200) return 'Title must be less than 200 characters';
        return '';
      case 'description':
        if (value && value.length > 500) return 'Description must be less than 500 characters';
        return '';
      case 'contentType':
        if (!value) return 'Content type is required';
        return '';
      case 'category':
        if (!value) return 'Category is required';
        return '';
      case 'classId':
        if (!value) return 'Class selection is required';
        return '';
      case 'subjectName':
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 2) return 'Subject name must be at least 2 characters';
        return '';
      case 'externalLink':
        if (uploadMethod === 'link' && !value.trim()) return 'Link/URL is required';
        if (value.trim()) {
          try {
            new URL(value);
          } catch {
            return 'Please enter a valid URL (e.g., https://example.com)';
          }
        }
        return '';
      default:
        return '';
    }
  }, [uploadMethod]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    // Validate upload method
    if (uploadMethod === 'file' && !selectedFile) {
      errors.file = 'Please select a file to upload';
    }
    if (uploadMethod === 'link' && !formData.externalLink.trim()) {
      errors.externalLink = 'Please enter a link/URL';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, selectedFile, uploadMethod, validateField]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear file error
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, file: 'File size must be less than 50MB' }));
      toast.error('File size must be less than 50MB');
      return;
    }

    // Check file type based on selected content type
    const selectedType = contentTypes.find(t => t.value === formData.contentType);
    if (selectedType && selectedType.accept && selectedType.value !== 'other') {
      const acceptedExtensions = selectedType.accept.split(',').map(ext => ext.trim());
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!acceptedExtensions.includes(fileExtension)) {
        setFieldErrors(prev => ({ 
          ...prev, 
          file: `Invalid file type. Expected: ${acceptedExtensions.join(', ')}` 
        }));
        toast.error(`Invalid file type for ${selectedType.label}`);
        return;
      }
    }

    setSelectedFile(file);
    toast.success(`File selected: ${file.name}`);
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadProgress(0);
      const response = await axios.post('/api/staff/upload-file', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      return response.data.fileUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
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

      toast.success('Content uploaded successfully!', {
        duration: 4000,
        icon: '🎉',
      });
      
      setShowModal(false);
      resetForm();
      fetchContents();
    } catch (error) {
      console.error('Error uploading content:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload content';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (contentId) => {
    const confirmed = window.confirm('Are you sure you want to delete this content? This action cannot be undone.');
    if (!confirmed) return;

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
    setFieldErrors({});
    setUploadProgress(0);
  };

  const getContentIcon = (type) => {
    const typeObj = contentTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : FaFileAlt;
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
    const categoryObj = categories.find(c => c.value === category);
    const badges = {
      lesson: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Lesson' },
      assignment: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Assignment' },
      study_material: { color: 'bg-green-100 text-green-700 border-green-300', label: 'Study Material' },
      reference: { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Reference' },
      exam_preparation: { color: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Exam Prep' }
    };
    return badges[category] || { color: 'bg-gray-100 text-gray-700 border-gray-300', label: categoryObj?.label || category };
  };

  // Filter content
  const filteredContents = contents.filter(content => {
    const classMatch = filterClass === 'all' || content.classId === filterClass;
    const typeMatch = filterType === 'all' || content.contentType === filterType;
    return classMatch && typeMatch;
  });

  const hasErrors = Object.keys(fieldErrors).length > 0;

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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl">
                  <FaUpload className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-black">
                    Learning Content
                  </h1>
                  <p className="text-purple-100 font-semibold">Upload and manage class-wise study materials</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <FaPlus />
                Upload Content
              </button>
            </div>
          </div>

          {/* Required Fields Info */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Required Information</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• <strong>Title</strong> - Clear, descriptive title (3-200 characters)</li>
                  <li>• <strong>Content Type</strong> - Select the type of material (Document, PDF, Video, etc.)</li>
                  <li>• <strong>Category</strong> - Choose appropriate category (Lesson, Assignment, Study Material, etc.)</li>
                  <li>• <strong>Class</strong> - Select which class can access this content</li>
                  <li>• <strong>Subject</strong> - Specify the subject/topic</li>
                  <li>• <strong>Upload Method</strong> - Either upload a file from your computer OR provide an external link</li>
                  <li className="text-amber-700 italic">• Description and Tags are optional but recommended</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Only students enrolled in the selected class can view the content</li>
                  <li>• Maximum file size: <strong>50MB</strong></li>
                  <li>• Supported file types: PDF, DOC, DOCX, PPT, PPTX, MP4, Images, ZIP</li>
                  <li>• For large videos, consider uploading to YouTube/Drive and providing a link</li>
                  <li>• Use meaningful titles and descriptions for better searchability</li>
                  <li>• Add tags to help students find related content easily</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-purple-600" />
              <h3 className="text-lg font-black">Filters</h3>
            </div>
            <div className="flex flex-wrap gap-3">
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
                  {contentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {(filterClass !== 'all' || filterType !== 'all') && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredContents.length} of {contents.length} content items
                </p>
                <button
                  onClick={() => {
                    setFilterClass('all');
                    setFilterType('all');
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaBook className="text-3xl" />
                <span className="text-4xl font-black">{contents.length}</span>
              </div>
              <p className="font-bold text-lg">Total Content</p>
              <p className="text-blue-100 text-sm">Uploaded</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaChalkboard className="text-3xl" />
                <span className="text-4xl font-black">{myClasses.length}</span>
              </div>
              <p className="font-bold text-lg">Your Classes</p>
              <p className="text-green-100 text-sm">Assigned</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaVideo className="text-3xl" />
                <span className="text-4xl font-black">{contents.filter(c => c.contentType === 'video').length}</span>
              </div>
              <p className="font-bold text-lg">Videos</p>
              <p className="text-purple-100 text-sm">Uploaded</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FaFilePdf className="text-3xl" />
                <span className="text-4xl font-black">{contents.filter(c => c.contentType === 'pdf' || c.contentType === 'document').length}</span>
              </div>
              <p className="font-bold text-lg">Documents</p>
              <p className="text-orange-100 text-sm">Uploaded</p>
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
                          title="Delete content"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <h3 className="text-xl font-black mb-2 line-clamp-2">{content.title}</h3>
                      <p className="text-sm opacity-90 mb-3 line-clamp-2">{content.description || 'No description'}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 ${categoryBadge.color} border-2 rounded-full text-xs font-bold`}>
                          {categoryBadge.label}
                        </span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                          {content.classId}
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

                      {content.tags && content.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {content.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 my-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaUpload className="text-purple-600 text-xl" />
                  </div>
                  <h2 className="text-3xl font-black text-purple-600">Upload Learning Content</h2>
                </div>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                      fieldErrors.title 
                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : formData.title.trim()
                          ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                          : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                    }`}
                    placeholder="e.g., Chapter 5: Quadratic Equations - Complete Notes"
                    maxLength="200"
                  />
                  {fieldErrors.title && (
                    <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                      <FaExclamationTriangle />
                      {fieldErrors.title}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">{formData.title.length}/200 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                      fieldErrors.description 
                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-200'
                    }`}
                    rows="3"
                    placeholder="Brief description of the content (helps students understand what they'll learn)"
                    maxLength="500"
                  />
                  {fieldErrors.description && (
                    <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                      <FaExclamationTriangle />
                      {fieldErrors.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">{formData.description.length}/500 characters</p>
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
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.classId 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : formData.classId
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                            : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                    >
                      <option value="">-- Select Class --</option>
                      {myClasses.map((cls, idx) => (
                        <option key={idx} value={cls.className}>{cls.className}</option>
                      ))}
                    </select>
                    {fieldErrors.classId && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.classId}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">⚠️ Only this class can see this content</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    {mySubjects.length > 0 ? (
                      <select
                        name="subjectName"
                        value={formData.subjectName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.subjectName 
                            ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                            : formData.subjectName
                              ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                              : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                        }`}
                      >
                        <option value="">-- Select Subject --</option>
                        {mySubjects.map((subject) => (
                          <option key={subject._id} value={subject.name}>{subject.name} ({subject.code})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="subjectName"
                        value={formData.subjectName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                          fieldErrors.subjectName 
                            ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                            : formData.subjectName
                              ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                              : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                        }`}
                        placeholder="e.g., Mathematics"
                      />
                    )}
                    {fieldErrors.subjectName && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.subjectName}
                      </p>
                    )}
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
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.contentType 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                      }`}
                    >
                      {contentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {fieldErrors.contentType && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.contentType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.category 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                      }`}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    {fieldErrors.category && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Upload Method Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    How do you want to add content? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadMethod"
                        value="file"
                        checked={uploadMethod === 'file'}
                        onChange={(e) => {
                          setUploadMethod(e.target.value);
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.externalLink;
                            return newErrors;
                          });
                        }}
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
                        onChange={(e) => {
                          setUploadMethod(e.target.value);
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.file;
                            return newErrors;
                          });
                        }}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="font-semibold">🔗 Provide External Link</span>
                    </label>
                  </div>
                </div>

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Select File <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.file 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : selectedFile
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                            : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mp3,.zip"
                    />
                    {fieldErrors.file && (
                      <p className="text-red-600 text-sm mt-2 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.file}
                      </p>
                    )}
                    {selectedFile && !fieldErrors.file && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-semibold">
                        <FaCheckCircle />
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: PDF, DOC, PPT, Images, Videos, ZIP (Max 50MB)
                    </p>
                  </div>
                )}

                {/* External Link */}
                {uploadMethod === 'link' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Content Link/URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="externalLink"
                      value={formData.externalLink}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all ${
                        fieldErrors.externalLink 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : formData.externalLink.trim()
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                            : 'border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                      placeholder="https://youtube.com/... or https://drive.google.com/..."
                    />
                    {fieldErrors.externalLink && (
                      <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle />
                        {fieldErrors.externalLink}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Enter URL to your content (YouTube, Google Drive, Dropbox, OneDrive, etc.)
                    </p>
                  </div>
                )}

                {/* Upload Progress */}
                {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-blue-900">Uploading...</span>
                      <span className="text-sm font-bold text-blue-900">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
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
                    placeholder="algebra, equations, chapter-5, practice (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas - helps with searchability</p>
                </div>

                {/* Info Box */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-purple-600 text-xl mt-0.5" />
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
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || hasErrors}
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Processing...'}
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
