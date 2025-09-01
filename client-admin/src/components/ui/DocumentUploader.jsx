import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const DocumentUploader = ({
  onUploadComplete,
  disabled = false,
  allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className,
  trigger,
  tenantId,
  userId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        return false;
      }

      // Check file size
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${Math.round(maxFileSize / 1024 / 1024)}MB size limit.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    setFiles(prevFiles => [
      ...prevFiles,
      ...validFiles.map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: 0
      }))
    ]);
  };

  const removeFile = (fileId) => {
    setFiles(files => files.filter(f => f.id !== fileId));
  };

  const uploadFile = async (fileItem) => {
    try {
      // Update file status to uploading
      setFiles(files => files.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 10 }
          : f
      ));

      // Step 1: Get presigned upload URL
      const uploadUrlResponse = await fetch('/api/documents/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fileName: fileItem.file.name,
          tenantId: tenantId?.toString(),
          userId: userId?.toString()
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl } = await uploadUrlResponse.json();

      // Update progress
      setFiles(files => files.map(f => 
        f.id === fileItem.id 
          ? { ...f, progress: 30 }
          : f
      ));

      // Step 2: Upload file to presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileItem.file,
        headers: {
          'Content-Type': fileItem.file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Update progress
      setFiles(files => files.map(f => 
        f.id === fileItem.id 
          ? { ...f, progress: 70 }
          : f
      ));

      // Step 3: Complete upload and save to database
      const completeResponse = await fetch('/api/documents/complete-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fileName: fileItem.file.name,
          originalName: fileItem.file.name,
          fileSize: fileItem.file.size,
          mimeType: fileItem.file.type,
          tenantId: tenantId?.toString(),
          userId: userId?.toString(),
          uploadUrl
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      const result = await completeResponse.json();

      // Update file status to completed
      setFiles(files => files.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'completed', progress: 100, document: result.document }
          : f
      ));

      return result.document;

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(files => files.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', progress: 0, error: error.message }
          : f
      ));
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !tenantId || !userId) {
      toast({
        title: "Cannot upload",
        description: "No files selected or missing tenant/user information.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = files
        .filter(f => f.status === 'pending')
        .map(fileItem => uploadFile(fileItem));

      const uploadedDocuments = await Promise.all(uploadPromises);
      
      toast({
        title: "Upload successful",
        description: `${uploadedDocuments.length} document(s) uploaded successfully.`,
      });

      // Call onUploadComplete with uploaded documents
      if (onUploadComplete) {
        onUploadComplete(uploadedDocuments);
      }

      // Reset state
      setTimeout(() => {
        setFiles([]);
        setIsOpen(false);
      }, 1500);

    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUpload = files.some(f => f.status === 'pending') && !uploading;

  const defaultTrigger = (
    <Button 
      variant="outline" 
      disabled={disabled}
      className={cn("gap-2", className)}
      data-testid="button-upload-document"
    >
      <Upload className="h-4 w-4" />
      Upload Document
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
              uploading && "opacity-50 pointer-events-none"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            data-testid="dropzone-upload"
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop files here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-500 font-medium"
                disabled={uploading}
                data-testid="button-browse-files"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Supported: {allowedTypes.join(', ')} (Max {Math.round(maxFileSize / 1024 / 1024)}MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            data-testid="input-file-hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  data-testid={`file-item-${fileItem.id}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getStatusIcon(fileItem.status)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                      {fileItem.status === 'error' && (
                        <p className="text-xs text-red-600">{fileItem.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {fileItem.status === 'uploading' && (
                    <div className="w-20">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {(fileItem.status === 'pending' || fileItem.status === 'error') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 h-auto"
                      data-testid={`button-remove-file-${fileItem.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploading}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              className="gap-2"
              data-testid="button-start-upload"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Upload {files.filter(f => f.status === 'pending').length} File(s)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploader;