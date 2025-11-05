import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FaUpload, FaFileAlt, FaBook, FaVideo, FaFilePdf } from 'react-icons/fa';

export default function UploadContent() {
  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaUpload className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Upload Content
                </h1>
                <p className="text-gray-600 font-semibold">Share study materials and resources with students</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-900 mb-2">LMS Content Upload</p>
            <p className="text-gray-600">Upload PDFs, videos, and study materials for your students</p>
            <p className="text-sm text-purple-600 font-bold mt-4">Feature coming soon</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

