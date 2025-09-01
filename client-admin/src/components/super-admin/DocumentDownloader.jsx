import React, { useState } from 'react';
import Button from '../ui/Button';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DocumentDownloader = ({ 
  document, 
  className = "",
  disabled = false,
  variant = "outline"
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (disabled || isDownloading) return;

    setIsDownloading(true);
    
    try {
      // Get download URL from backend
      const response = await axios.get(
        `${API_BASE_URL}/deleted-documents/${document.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { downloadUrl, fileName, fileSize, contentType } = response.data;

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || `document-${document.id}`;
      link.target = '_blank';
      
      // Add link to DOM temporarily and click it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started successfully!');
      
    } catch (error) {
      console.error('Download error:', error);
      
      if (error.response?.status === 404) {
        toast.error('No file found for this document');
      } else if (error.response?.status === 503) {
        toast.error('Storage service not configured');
      } else {
        toast.error('Failed to download document');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      className={`${className} ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
      size="sm"
      variant={variant}
      title="Download document file"
    >
      {isDownloading ? (
        <>
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Downloading...
        </>
      ) : (
        <>
          <i className="fas fa-download mr-2"></i>
          Download
        </>
      )}
    </Button>
  );
};

export default DocumentDownloader;