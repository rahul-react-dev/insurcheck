import AWS from 'aws-sdk';

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.bucketName = process.env.AWS_BUCKET_NAME;
    
    if (!this.bucketName) {
      console.warn('⚠️  AWS_BUCKET_NAME not configured - S3 features disabled');
    }
  }

  isConfigured() {
    return !!(
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_BUCKET_NAME
    );
  }

  /**
   * Generate presigned URL for file upload
   */
  async getPresignedUploadUrl(key, contentType, expiresIn = 3600) {
    if (!this.isConfigured()) {
      throw new Error('S3 not configured');
    }

    const params = {
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('putObject', params);
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Generate presigned URL for file download
   */
  async getPresignedDownloadUrl(key, expiresIn = 3600) {
    if (!this.isConfigured()) {
      throw new Error('S3 not configured');
    }

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(key) {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      await this.s3.headObject({
        Bucket: this.bucketName,
        Key: key,
      }).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key) {
    if (!this.isConfigured()) {
      throw new Error('S3 not configured');
    }

    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key,
      }).promise();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key) {
    if (!this.isConfigured()) {
      throw new Error('S3 not configured');
    }

    try {
      const result = await this.s3.headObject({
        Bucket: this.bucketName,
        Key: key,
      }).promise();
      
      return {
        size: result.ContentLength,
        contentType: result.ContentType,
        lastModified: result.LastModified,
        etag: result.ETag,
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Generate S3 key for deleted document
   */
  generateDeletedDocumentKey(documentId, originalName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalName.split('.').pop();
    return `deleted-documents/${documentId}/${timestamp}.${extension}`;
  }

  /**
   * Get public URL for file (if bucket is public)
   */
  getPublicUrl(key) {
    if (!this.bucketName) return null;
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}

export default new S3Service();