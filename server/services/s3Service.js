import { S3Client, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileTypeFromBuffer } from 'file-type';
import { config } from '../src/config/env.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: config.awsRegion || process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: config.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
  }
});

console.log(`🔑 S3 Client initialized with region: ${config.awsRegion || process.env.AWS_REGION || 'us-east-1'}`);

export class S3Service {
  constructor() {
    this.bucketName = config.awsS3BucketName || process.env.AWS_S3_BUCKET_NAME || 'insurcheck-documents';
    console.log(`🪣 S3 Service initialized with bucket: ${this.bucketName}`);
    console.log(`🔧 Config values - bucket: ${config.awsS3BucketName}, env: ${process.env.AWS_S3_BUCKET_NAME}`);
  }

  /**
   * Generate S3 key for document with tenant isolation
   * Format: tenant-{tenantId}/user-{userId}/{year}/{month}/{filename}
   */
  generateS3Key(tenantId, userId, filename) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `tenant-${tenantId}/user-${userId}/${year}/${month}/${filename}`;
  }

  /**
   * Get a pre-signed URL for downloading a document
   */
  async getPresignedDownloadUrl(s3Key, expiresIn = 300) { // 5 minutes default
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { 
        expiresIn 
      });

      console.log(`✅ Generated presigned download URL for: ${s3Key}`);
      return signedUrl;
    } catch (error) {
      console.error('❌ Error generating presigned download URL:', error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Get a pre-signed URL for uploading a document
   */
  async getPresignedUploadUrl(s3Key, contentType, expiresIn = 900) { // 15 minutes default
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { 
        expiresIn 
      });

      console.log(`✅ Generated presigned upload URL for: ${s3Key}`);
      return signedUrl;
    } catch (error) {
      console.error('❌ Error generating presigned upload URL:', error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Check if a document exists in S3
   */
  async documentExists(s3Key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      console.error('❌ Error checking document existence:', error);
      throw error;
    }
  }

  /**
   * Get document metadata from S3
   */
  async getDocumentMetadata(s3Key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await s3Client.send(command);
      return {
        contentLength: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
        etag: response.ETag,
      };
    } catch (error) {
      console.error('❌ Error getting document metadata:', error);
      throw new Error(`Failed to get document metadata: ${error.message}`);
    }
  }

  /**
   * Delete a document from S3
   */
  async deleteDocument(s3Key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await s3Client.send(command);
      console.log(`✅ Document deleted from S3: ${s3Key}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting document from S3:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Get S3 object URL (for public access)
   */
  getS3ObjectUrl(s3Key) {
    const baseUrl = config.s3BaseUrl || `https://s3.${config.awsRegion}.amazonaws.com`;
    return `${baseUrl}/${this.bucketName}/${s3Key}`;
  }

  /**
   * Validate file type and size
   */
  async validateFile(buffer, allowedTypes = [], maxSizeBytes = 10485760) { // 10MB default
    try {
      // Check file size
      if (buffer.length > maxSizeBytes) {
        throw new Error(`File size exceeds maximum allowed size of ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
      }

      // Detect file type
      const fileTypeResult = await fileTypeFromBuffer(buffer);
      
      if (!fileTypeResult) {
        throw new Error('Unable to determine file type');
      }

      // Check allowed types if specified
      if (allowedTypes.length > 0 && !allowedTypes.includes(fileTypeResult.mime)) {
        throw new Error(`File type ${fileTypeResult.mime} is not allowed`);
      }

      return {
        mimeType: fileTypeResult.mime,
        extension: fileTypeResult.ext,
        isValid: true
      };
    } catch (error) {
      console.error('❌ File validation error:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Get allowed file types for documents
   */
  getAllowedDocumentTypes() {
    return [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
  }

  /**
   * Get maximum file size based on tenant plan
   */
  getMaxFileSize(tenantPlan = 'basic') {
    const limits = {
      basic: 10485760, // 10MB
      premium: 52428800, // 50MB
      enterprise: 104857600 // 100MB
    };
    return limits[tenantPlan] || limits.basic;
  }
}

// Export singleton instance
export const s3Service = new S3Service();