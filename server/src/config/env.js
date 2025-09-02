import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  nodeEnv: process.env.NODE_ENV || 'development',
  // AWS S3 Configuration
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || 'insurcheck-documents-dev',
  s3BaseUrl: process.env.S3_BASE_URL,
  // Other services
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@insurcheck.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};