
import React from 'react';
import { Button } from '../ui/Button';

export const DeletedDocumentModal = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDocumentTypeIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: 'fas fa-file-pdf text-red-500',
      docx: 'fas fa-file-word text-blue-500',
      doc: 'fas fa-file-word text-blue-500',
      xlsx: 'fas fa-file-excel text-green-500',
      xls: 'fas fa-file-excel text-green-500',
      pptx: 'fas fa-file-powerpoint text-orange-500',
      ppt: 'fas fa-file-powerpoint text-orange-500',
      txt: 'fas fa-file-alt text-gray-500',
      jpg: 'fas fa-file-image text-purple-500',
      jpeg: 'fas fa-file-image text-purple-500',
      png: 'fas fa-file-image text-purple-500',
      gif: 'fas fa-file-image text-purple-500'
    };
    return iconMap[extension] || 'fas fa-file text-gray-500';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <i className={`${getDocumentTypeIcon(document.name)} text-2xl`}></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
                <p className="text-sm text-gray-600">View deleted document information</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <i className="fas fa-times text-gray-500"></i>
            </Button>
          </div>

          {/* Document Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Document ID:</label>
                  <p className="font-medium text-gray-900">DOC-{document.id}</p>
                </div>
                <div>
                  <label className="text-gray-600">Version:</label>
                  <p className="font-medium text-gray-900">v{document.version}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-600">Document Name:</label>
                  <p className="font-medium text-gray-900 break-all">{document.name}</p>
                </div>
                <div>
                  <label className="text-gray-600">File Size:</label>
                  <p className="font-medium text-gray-900">{formatFileSize(document.size)}</p>
                </div>
                <div>
                  <label className="text-gray-600">File Type:</label>
                  <p className="font-medium text-gray-900 uppercase">
                    {document.name.split('.').pop()}
                  </p>
                </div>
              </div>
            </div>

            {/* Ownership Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Ownership Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Original Owner:</label>
                  <div className="flex items-center mt-1">
                    <div className="h-6 w-6 bg-blue-200 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-user text-blue-600 text-xs"></i>
                    </div>
                    <p className="font-medium text-gray-900">{document.originalOwner}</p>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600">Tenant:</label>
                  <p className="font-medium text-gray-900">{document.tenantName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600">Created Date:</label>
                  <p className="font-medium text-gray-900">{formatDate(document.createdAt)}</p>
                </div>
                <div>
                  <label className="text-gray-600">Last Modified:</label>
                  <p className="font-medium text-gray-900">{formatDate(document.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Deletion Information */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Deletion Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Deleted By:</label>
                  <div className="flex items-center mt-1">
                    <div className="h-6 w-6 bg-red-200 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-user-shield text-red-600 text-xs"></i>
                    </div>
                    <p className="font-medium text-gray-900">{document.deletedBy}</p>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600">Deletion Date:</label>
                  <p className="font-medium text-gray-900">{formatDate(document.deletedAt)}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-600">Deletion Reason:</label>
                  <p className="font-medium text-gray-900">
                    {document.deletionReason || 'No reason provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Tags */}
            {document.tags && document.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Document Description */}
            {document.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {document.description}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button variant="outline" onClick={onClose} className="order-2 sm:order-1">
              Close
            </Button>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = document.downloadUrl;
                link.download = document.name;
                link.click();
              }}
              className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-download mr-2"></i>
              Download Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
