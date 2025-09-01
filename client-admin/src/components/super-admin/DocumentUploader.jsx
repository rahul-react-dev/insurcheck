import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import { DashboardModal } from '@uppy/react';
import Button from '../ui/Button';
import { toast } from 'react-toastify';
import axios from 'axios';

// Import Uppy styles
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DocumentUploader = ({ 
  document, 
  onUploadComplete, 
  onUploadError,
  className = "",
  disabled = false 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      id: `document-uploader-${document.id}`,
      autoProceed: false,
      allowMultipleUploads: false,
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 50 * 1024 * 1024, // 50MB
      },
      onBeforeFileAdded: (currentFile) => {
        // Add document ID to file meta for reference
        const modifiedFile = {
          ...currentFile,
          meta: {
            ...currentFile.meta,
            documentId: document.id,
          },
        };
        return modifiedFile;
      },
    });

    // Configure AWS S3 plugin
    uppyInstance.use(AwsS3, {
      shouldUseMultipart: false,
      getUploadParameters: async (file) => {
        try {
          setIsUploading(true);
          
          // Get presigned URL from backend
          const response = await axios.post(
            `${API_BASE_URL}/deleted-documents/${document.id}/upload-url`,
            {
              fileName: file.name,
              contentType: file.type,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            }
          );

          return {
            method: 'PUT',
            url: response.data.uploadUrl,
            fields: {},
            headers: {
              'Content-Type': file.type,
            },
          };
        } catch (error) {
          console.error('Error getting upload URL:', error);
          toast.error('Failed to get upload URL');
          throw error;
        }
      },
    });

    // Handle upload completion
    uppyInstance.on('complete', async (result) => {
      try {
        if (result.successful.length > 0) {
          const file = result.successful[0];
          
          // Notify backend that upload completed
          await axios.patch(
            `${API_BASE_URL}/deleted-documents/${document.id}/file-uploaded`,
            {
              s3Key: file.meta.key || file.uploadURL?.split('?')[0]?.split('/').pop(),
              fileSize: file.size,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            }
          );

          toast.success('Document uploaded successfully!');
          onUploadComplete && onUploadComplete(document, file);
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error('Error notifying upload completion:', error);
        toast.error('Upload completed but failed to update record');
        onUploadError && onUploadError(error);
      } finally {
        setIsUploading(false);
      }
    });

    // Handle upload errors
    uppyInstance.on('upload-error', (file, error) => {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      onUploadError && onUploadError(error);
      setIsUploading(false);
    });

    return uppyInstance;
  });

  const handleOpenModal = useCallback(() => {
    if (disabled || isUploading) return;
    setIsModalOpen(true);
  }, [disabled, isUploading]);

  const handleCloseModal = useCallback(() => {
    if (isUploading) {
      toast.warning('Upload in progress. Please wait...');
      return;
    }
    setIsModalOpen(false);
  }, [isUploading]);

  return (
    <>
      <Button
        onClick={handleOpenModal}
        disabled={disabled || isUploading}
        className={`${className} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        size="sm"
        variant="outline"
        title="Upload document file"
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

      <DashboardModal
        uppy={uppy}
        open={isModalOpen}
        onRequestClose={handleCloseModal}
        target="body"
        closeModalOnClickOutside={!isUploading}
        disablePageScrollWhenModalOpen={true}
        proudlyDisplayPoweredByUppy={false}
        showProgressDetails={true}
        note={`Upload file for document: ${document.name}`}
        metaFields={[
          { id: 'name', name: 'File Name', placeholder: 'Enter file name' },
        ]}
      />
    </>
  );
};

export default DocumentUploader;