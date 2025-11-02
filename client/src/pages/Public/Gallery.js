import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FaSearch, FaImages, FaTrophy, FaTheaterMasks, FaFlask } from 'react-icons/fa';

const Gallery = () => {
  const categories = [
    { name: 'All', icon: FaImages, color: 'from-purple-500 to-purple-700', emoji: '🎨' },
    { name: 'Events', icon: FaTheaterMasks, color: 'from-blue-500 to-blue-700', emoji: '🎭' },
    { name: 'Sports', icon: FaTrophy, color: 'from-green-500 to-green-700', emoji: '⚽' },
    { name: 'Academic', icon: FaFlask, color: 'from-yellow-500 to-yellow-700', emoji: '📚' },
    { name: 'Facilities', icon: FaImages, color: 'from-pink-500 to-pink-700', emoji: '🏫' }
  ];

  const images = [
    { id: 1, title: 'Annual Day Celebration 2024', category: 'Events', image: 'https://placehold.co/600x400/667eea/FFFFFF?text=Annual+Day+🎊', likes: 245 },
    { id: 2, title: 'Sports Day Championship', category: 'Sports', image: 'https://placehold.co/600x400/10B981/FFFFFF?text=Sports+Day+🏆', likes: 189 },
    { id: 3, title: 'Science Exhibition', category: 'Academic', image: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Science+Fair+🔬', likes: 156 },
    { id: 4, title: 'Cultural Festival', category: 'Events', image: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Cultural+Fest+🎭', likes: 278 },
    { id: 5, title: 'Independence Day', category: 'Events', image: 'https://placehold.co/600x400/EF4444/FFFFFF?text=Independence+Day+🇮🇳', likes: 312 },
    { id: 6, title: 'Computer Lab', category: 'Facilities', image: 'https://placehold.co/600x400/6366F1/FFFFFF?text=Computer+Lab+💻', likes: 134 },
    { id: 7, title: 'Library', category: 'Facilities', image: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Library+📚', likes: 167 },
    { id: 8, title: 'Chemistry Lab', category: 'Facilities', image: 'https://placehold.co/600x400/14B8A6/FFFFFF?text=Chemistry+Lab+🧪', likes: 145 },
    { id: 9, title: 'Basketball Tournament', category: 'Sports', image: 'https://placehold.co/600x400/F97316/FFFFFF?text=Basketball+🏀', likes: 201 },
    { id: 10, title: 'Math Olympiad', category: 'Academic', image: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Math+Olympiad+🔢', likes: 178 },
    { id: 11, title: 'Art Exhibition', category: 'Events', image: 'https://placehold.co/600x400/F472B6/FFFFFF?text=Art+Show+🎨', likes: 223 },
    { id: 12, title: 'Cricket Match', category: 'Sports', image: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Cricket+🏏', likes: 267 }
  ];

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredImages = images.filter(img => {
    const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-600 via-purple-500 to-blue-500 text-white py-24 overflow-hidden">
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
                📸 Our Memories
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
              <span className="block">Photo</span>
              <span className="block text-yellow-300">Gallery</span>
            </h1>
            <p className="text-2xl md:text-3xl text-purple-100 font-light">
              Glimpses of Life at DAV School
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-12 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8 animate-fadeInUp">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search photos..."
                  className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-lg shadow-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-purple-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-8 flex-wrap gap-4 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            {categories.map((category, index) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-3 ${
                  selectedCategory === category.name
                    ? `bg-gradient-to-r ${category.color} text-white scale-105`
                    : 'bg-white text-gray-700 hover:shadow-xl'
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <span className="text-2xl">{category.emoji}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="text-center mb-6 animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <p className="text-gray-600 font-semibold">
              Showing <span className="text-purple-600 font-bold text-xl">{filteredImages.length}</span> {filteredImages.length === 1 ? 'photo' : 'photos'}
            </p>
          </div>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="group cursor-pointer animate-fadeInUp"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="modern-card overflow-hidden hover-lift">
                    {/* Image Container */}
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={image.image}
                        alt={image.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r ${
                          categories.find(c => c.name === image.category)?.color || 'from-gray-500 to-gray-700'
                        } text-white shadow-lg`}>
                          {image.category}
                        </span>
                      </div>

                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                        <div className="text-white p-4 text-center w-full">
                          <p className="font-bold text-lg mb-2">View Photo</p>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-2xl">❤️</span>
                            <span className="font-semibold">{image.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Title & Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                        {image.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">👁️</span> 
                          {Math.floor(Math.random() * 1000) + 500} views
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">❤️</span> 
                          {image.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-bounce-slow">🔍</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">No Photos Found</h3>
              <p className="text-gray-600 text-lg mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                }}
                className="btn btn-primary"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-10"
              style={{
                width: `${Math.random() * 80 + 40}px`,
                height: `${Math.random() * 80 + 40}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 12 + 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="text-6xl mb-6 animate-bounce-slow">📸</div>
          <h2 className="text-5xl font-extrabold mb-6 animate-fadeInUp">
            Want to Be Part of These Memories?
          </h2>
          <p className="text-2xl mb-10 text-purple-100 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            Join DAV School and create your own success stories!
          </p>
          <a 
            href="/admission" 
            className="btn bg-white text-purple-600 hover:bg-yellow-300 text-xl px-10 py-5 inline-flex items-center justify-center shadow-2xl animate-pulse-slow"
          >
            Apply for Admission
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
