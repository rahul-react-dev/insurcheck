import React, { useState, useCallback, useRef, useEffect } from 'react';
// import { toast } from 'react-toastify';
import Button from '../ui/Button';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FileUploadModal = ({ 
  isOpen, 
  onClose, 
  document, 
  onUploadComplete 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus modal for accessibility
      modalRef.current?.focus();
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Reset state when closing
      setSelectedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      // toast.error('Please select a file to upload');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      // toast.error('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned upload URL
      const uploadResponse = await axios.post(
        `${API_BASE_URL}/deleted-documents/${document.id}/upload-url`,
        {
          fileName: selectedFile.name,
          contentType: selectedFile.type || 'application/octet-stream',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { uploadUrl, s3Key } = uploadResponse.data;

      // Step 2: Upload file to S3
      await axios.put(uploadUrl, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type || 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(progress);
        },
      });

      // Step 3: Notify backend about successful upload
      await axios.patch(
        `${API_BASE_URL}/deleted-documents/${document.id}/file-uploaded`,
        {
          s3Key,
          fileSize: selectedFile.size,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // toast.success('File uploaded successfully!');
      onUploadComplete && onUploadComplete(document, { s3Key, file: selectedFile });
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 503) {
        // toast.error('Storage service not configured. Please contact administrator.');
      } else if (error.response?.status === 404) {
        // toast.error('Document not found or already has a file.');
      } else {
        // toast.error('Failed to upload file. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (isUploading) {
      // toast.warning('Upload in progress. Please wait...');
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Upload File for Document
          </h3>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Document Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Document</div>
            <div className="font-medium text-gray-900 truncate">
              {document.originalName || document.filename}
            </div>
            <div className="text-xs text-gray-500">ID: DOC-{document.id}</div>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <i className="fas fa-file-alt text-3xl text-green-500"></i>
                <div className="font-medium text-gray-900">
                  {selectedFile.name}
                </div>
                <div className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                <div>
                  <div className="text-gray-900 font-medium">
                    Drop file here or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700"
                      disabled={isUploading}
                    >
                      browse
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Maximum file size: 50MB
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i>
                Upload File
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;