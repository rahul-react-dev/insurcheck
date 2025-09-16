# InsurCheck SaaS - Independent Deployment Guide

## Overview
InsurCheck has been successfully separated into 3 independent, deployable components:

1. **Server** (API-only backend)
2. **Client-Admin** (React frontend for Super & Tenant Admins)  
3. **Client-User** (React frontend for Tenant Users)

Each component can be deployed on separate servers/services (Vercel, Netlify, Railway, etc.) while maintaining all functionality including multi-tenancy, role-based access, and real-time features.

## 🚀 Component Architecture

### Server (API Backend)
- **Purpose**: API-only backend with no static file serving
- **Technologies**: Node.js, Express, PostgreSQL, Drizzle ORM
- **Port**: 5000 (configurable)
- **Dependencies**: All database, authentication, payment, and email services

### Client-Admin  
- **Purpose**: Admin dashboard for Super Admins and Tenant Admins
- **Technologies**: React, Vite, TypeScript, Tailwind CSS
- **Port**: 3000 (development)
- **Features**: Tenant management, user management, analytics, invoicing

### Client-User
- **Purpose**: User portal for tenant users
- **Technologies**: React, Vite, TypeScript, Tailwind CSS  
- **Port**: 3001 (development)
- **Features**: User dashboard, document management, compliance

## 🔧 Environment Configuration

### Server Environment Variables
Create `.env` file in `server/` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your_postgres_host
PGPORT=5432
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=your_database_name

# Authentication
JWT_SECRET=your_jwt_secret_key

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region

# CORS Configuration for Independent Clients
CLIENT_ADMIN_URL=https://your-admin-domain.com
CLIENT_USER_URL=https://your-user-domain.com
CORS_ORIGINS=https://additional-domain1.com,https://additional-domain2.com

# Application Settings
NODE_ENV=production
PORT=5000
```

### Client-Admin Environment Variables  
Create `.env` file in `client-admin/` directory:

```env
# API Configuration - Point to your deployed server
VITE_API_BASE_URL=https://your-api-server.com

# Stripe Configuration (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Application Settings
VITE_APP_NAME="InsurCheck Admin"
VITE_APP_VERSION="1.0.0"
VITE_NODE_ENV=production
```

### Client-User Environment Variables
Create `.env` file in `client-user/` directory:

```env  
# API Configuration - Point to your deployed server
VITE_API_BASE_URL=https://your-api-server.com

# Application Settings
VITE_APP_NAME="InsurCheck User Portal"
VITE_APP_VERSION="1.0.0"
VITE_NODE_ENV=production
```

## 📦 Deployment Instructions

### 1. Deploy Server (Backend)

#### Option A: Railway/Render/Heroku
1. Connect your repository
2. Set build command: `cd server && npm install && npm run build`
3. Set start command: `cd server && npm start`
4. Configure all environment variables listed above
5. Ensure PostgreSQL addon is connected

#### Option B: VPS/Docker
```bash
# Clone repository
git clone your-repo-url
cd your-repo/server

# Install dependencies
npm install

# Build application  
npm run build

# Start production server
npm start
```

### 2. Deploy Client-Admin (Frontend)

#### Option A: Vercel
1. Connect repository
2. Set build command: `cd client-admin && npm install && npm run build`
3. Set output directory: `client-admin/dist`
4. Configure environment variables
5. Deploy

#### Option B: Netlify
1. Connect repository  
2. Set build command: `cd client-admin && npm install && npm run build`
3. Set publish directory: `client-admin/dist`
4. Configure environment variables
5. Deploy

### 3. Deploy Client-User (Frontend)

#### Same process as Client-Admin:
1. Set build command: `cd client-user && npm install && npm run build`
2. Set output directory: `client-user/dist`
3. Configure environment variables
4. Deploy

## 🔐 Security Considerations

### CORS Configuration
The server is configured to accept requests from specified client domains:
- Set `CLIENT_ADMIN_URL` to your admin frontend domain
- Set `CLIENT_USER_URL` to your user frontend domain  
- Add additional domains to `CORS_ORIGINS` (comma-separated)

### SSL/HTTPS
- All production deployments should use HTTPS
- Update environment variables to use `https://` URLs
- Configure SSL certificates on your hosting platform

### API Security
- Server includes rate limiting, helmet security headers
- JWT tokens for stateless authentication
- Password hashing with bcrypt
- Input validation and sanitization

## 🧪 Testing Independence

### Server Health Check
```bash
curl https://your-api-server.com/api/health
```

### Client-Admin Connection Test
1. Open admin frontend in browser
2. Check browser console for API connection logs
3. Verify login functionality works

### Client-User Connection Test  
1. Open user frontend in browser
2. Check browser console for API connection logs
3. Verify signup/login functionality works

## 🚀 Local Development

Each component can be developed independently:

### Server
```bash
cd server
npm install
npm run dev  # Runs on port 5000
```

### Client-Admin
```bash
cd client-admin  
npm install
npm run dev  # Runs on port 3000
```

### Client-User
```bash
cd client-user
npm install
npm run dev  # Runs on port 3001
```

## 📊 Features Maintained

✅ **Multi-Tenant Architecture**: Full tenant isolation and management
✅ **Role-Based Access Control**: Super Admin, Tenant Admin, User roles  
✅ **Real-Time Updates**: Live notifications and data synchronization
✅ **Payment Processing**: Stripe integration for subscriptions and invoicing
✅ **Email Notifications**: SendGrid integration for all email features
✅ **Document Management**: AWS S3 integration for file storage
✅ **Analytics & Reporting**: Comprehensive dashboards and export features
✅ **Audit Logging**: Full activity tracking and compliance monitoring
✅ **API Security**: JWT authentication, rate limiting, CORS protection

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Verify `CLIENT_ADMIN_URL` and `CLIENT_USER_URL` are correctly set
2. **API Connection Failed**: Check `VITE_API_BASE_URL` in client environment files
3. **Database Connection**: Verify all PostgreSQL environment variables are correct
4. **Email Not Sending**: Confirm SendGrid API key and verified sender email
5. **Payment Issues**: Validate Stripe keys and webhook configuration

### Debug Steps
1. Check browser console for error messages
2. Verify API server health endpoint responds
3. Confirm environment variables are loaded correctly
4. Test API endpoints directly with curl/Postman

## 📝 Additional Notes

- Each component has its own `package.json` with all required dependencies
- Database migrations are handled by the server component only
- Clients automatically handle API communication via environment variables
- All components support hot reloading in development mode
- Production builds are optimized for performance and security

For support or questions, please refer to the application documentation or contact the development team.