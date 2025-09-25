# Overview
InsurCheck is a multi-tenant SaaS insurance management platform designed to provide a comprehensive solution for insurance management. It features separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. Key capabilities include user management, subscription handling, payment processing, invoice generation, and compliance analytics. The platform aims for a professional and consistent user experience in the insurance sector.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture
The project utilizes a monorepo structure, organizing code into `client-admin` (React frontend for Super and Tenant Admins), `client-user` (React frontend for Tenant Users), `server` (Express.js backend), and `shared` (common schemas).

## Frontend Architecture
All React frontends are built with Vite, styled using Tailwind CSS with a custom blue gradient design system, manage state with Redux Toolkit and Redux-Saga, handle navigation with React Router, and make HTTP requests via Axios. UI components are developed using `shadcn/ui` based on Radix UI, ensuring design consistency and accessibility. Professional Chart.js integration is used for data visualization, specifically for compliance analytics, including interactive pie, bar, and line charts with accessibility features. A professional toast notification system provides user feedback for all operations.

## Backend Architecture
The backend is developed with Express.js and TypeScript, using Drizzle ORM for PostgreSQL database interactions. Multi-tenancy is achieved via `tenant_id` fields. Authentication is JWT-based with role-based access control. API endpoints are RESTful, secured with middleware for CORS, helmet, and rate limiting, and include robust error handling and isolation mechanisms. Key functionalities include tenant creation, secure password setup, and comprehensive API endpoints for invoice management, user management, and compliance analytics. Backend pagination is implemented for efficient data handling.

## Database Design
A PostgreSQL database is used, managed by Drizzle ORM for type-safe operations and migrations. The schema supports multi-tenancy and a role-based user system.

## Security & Authentication
Security features include JWT tokens for stateless authentication, bcrypt for password hashing, `express-validator` for input sanitization, and role-based access control. CORS is configured to restrict access to allowed origins. The system supports multi-tab access for different user roles and provides secure token-based invitation and password setup flows.

# External Dependencies

## Database
- **PostgreSQL**: Primary relational database.
- **Drizzle ORM**: For type-safe database operations and migrations.

## UI Libraries
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library for visual elements.
- **shadcn/ui**: Component library built on Radix UI and Tailwind CSS.
- **chart.js**: For data visualization and charting.
- **react-chartjs-2**: React wrapper for Chart.js.

## Development Tools
- **Vite**: Fast build tool and development server.
- **TypeScript**: For type safety across the codebase.
- **ESLint**: Code linting for consistent code quality.

## Backend Dependencies
- **Express.js**: Core web application framework.
- **cors**: Middleware for enabling Cross-Origin Resource Sharing.
- **helmet**: Middleware for securing Express apps by setting various HTTP headers.
- **express-rate-limit**: Middleware for limiting repeated requests to public APIs.
- **jsonwebtoken**: For implementing JSON Web Token based authentication.
- **bcryptjs**: For hashing passwords securely.

## State Management
- **Redux Toolkit**: Simplified Redux development for state management.
- **Redux-Saga**: For managing side effects (like asynchronous API calls) in Redux applications.

# Recent Changes

## Email Verification URL Production Fix (Complete)
- **Issue**: Email verification links were using Replit URLs instead of production URLs even with FRONTEND_URL set
- **Root Cause**: Dynamic hostname detection logic in `authController.js` was prioritizing request origin over FRONTEND_URL environment variable
- **Problematic Code**: `if (url.hostname.includes('replit.dev'))` forced Replit URLs for all email verification links
- **Solution**: Replaced dynamic detection with fixed production URL logic: `const frontendUrl = process.env.FRONTEND_URL || 'https://dev-user.insurcheck.ai'`
- **Files Changed**: `server/src/controllers/authController.js` - both signup (lines 802-807) and resend verification (lines 1124-1129) endpoints
- **Testing**: Confirmed email verification links now use https://dev-user.insurcheck.ai instead of Replit URLs
- **Architecture**: Email verification links should ALWAYS use production URLs regardless of development environment
- **Prevention**: Email systems must never use dynamic hostname detection - always use explicit production URLs

## Admin Setup Password & Token Verification 500 Error Fix (Complete)
- **Issue**: Both `/api/admin/verify-setup-token` and `/api/admin/setup-password` endpoints returning 500 Internal Server Error due to PostgreSQL type mismatch
- **Root Cause**: Database queries used `password_reset_expires > NOW()` but column was stored as text, not timestamp type
- **Error**: `operator does not exist: text > timestamp with time zone`
- **Solution**: Replaced SQL comparisons with JavaScript-based date validation for type safety in both endpoints
- **Backend Changes**: Updated queries in `server/routes.js` to use `eq()` instead of raw SQL, added proper expiration checking
- **Testing**: Both endpoints now return 200 OK with correct JSON response structure
- **End-to-End Verified**: Complete tenant admin setup flow tested successfully (create tenant → verify token → setup password → login)
- **Architecture**: Maintains backward compatibility and works with any date storage format

## Admin Frontend API Domain Routing Fix (Complete)
- **Issue**: Admin frontend API calls were going to dev-admin.insurcheck.ai instead of dev-api.insurcheck.ai
- **Root Cause**: PasswordSetup.jsx was using direct fetch calls instead of centralized API configuration
- **Solution**: Extended adminAuthApi with verifySetupToken and setupPassword functions, updated PasswordSetup.jsx to use centralized API
- **Frontend Changes**: Added API functions to `client-admin/src/utils/api.js` and updated `client-admin/src/pages/admin/PasswordSetup.jsx`
- **Architecture**: Maintains consistent API pattern where dev-admin.insurcheck.ai maps to dev-api.insurcheck.ai
- **Testing**: Server running successfully with proper domain routing established

## Tenant Admin Setup URL Fix (Complete)
- **Issue**: "Complete Your Account Setup" email was redirecting to wrong domain (dev-user.insurcheck.ai instead of dev-admin.insurcheck.ai)
- **Root Cause**: Tenant admin setup URL was using FRONTEND_URL (user domain) instead of ADMIN_FRONTEND_URL (admin domain)
- **Solution**: Updated tenant creation logic in `server/routes.js` to use correct admin frontend URL
- **Backend Changes**: Fixed setupLink generation to use `process.env.ADMIN_FRONTEND_URL || 'https://dev-admin.insurcheck.ai'`
- **Testing**: Verified all other email flows remain correct (user invitations, password resets, email verification)
- **Logic Verified**: Confirmed proper URL routing for all email types across user and admin domains

## Password Reset Token Validation Fix (Complete)
- **Issue**: Token validation was failing with 400 status code due to mismatch between token storage and validation logic
- **Root Cause**: Tokens were stored as raw text but validation was hashing incoming tokens and searching for hashed versions
- **Solution**: Updated `validateResetToken` function to handle both raw and hashed tokens for backward compatibility
- **Backend Changes**: Enhanced `server/src/controllers/authController.js` with improved logging and dual token matching
- **Testing**: Confirmed working on both localhost and external domains with proper CORS handling
- **Architecture**: Maintains consistent centralized API pattern established across frontend

## Email Verification System Implementation (Complete)
- **Database Schema**: Added email verification fields to users table
  - `emailVerificationToken` (VARCHAR): Unique verification token
  - `emailVerificationExpires` (TIMESTAMP): 24-hour expiration
  - `emailVerified` (BOOLEAN): Verification status
  - `emailVerificationResendCount` (INTEGER): Rate limiting (max 3/hour)
  - `emailVerificationLastSent` (TIMESTAMP): Resend tracking

- **SendGrid Integration**: 
  - Configured with verified sender identity 'rahul.soni@solulab.co'
  - Comprehensive email templates for verification with professional styling
  - Enhanced error logging and response tracking

- **Client-User Frontend**:
  - Vite proxy configuration to forward /api requests from port 3001 to 5000
  - SignUp page with single-button modal redirecting to login after successful registration
  - VerifyEmail page with token validation, success/error states, and resend functionality
  - Rate limiting UI (3 resends per hour) with user feedback
  - Manual redirect only (removed automatic redirects)

- **Backend API Endpoints**:
  - `/api/auth/signup`: Creates user with verification token, sends email
  - `/api/auth/verify-email`: Validates token, activates account (no auto-login)
  - `/api/auth/resend-verification`: Resends verification with rate limiting
  - Dynamic frontend URL detection for correct verification links

- **Security & Flow**:
  - Users cannot login until email is verified
  - Verification activates account but requires manual login
  - Token expires in 24 hours
  - Rate limiting prevents spam (3 resends per hour)
  - Proper error handling and user feedback throughout

## Automatic Invoice Generation System (Complete)
- **Production-Ready Cron Job Implementation**: Automated hourly invoice generation using node-cron scheduler with timezone-aware processing
- **Database Schema Support**: Utilizes existing invoice_generation_configs table with tenant-specific settings for frequency, timezone, and weekend preferences
- **Timezone Handling**: Full Luxon library integration for accurate timezone-aware date calculations and weekend detection
- **Key Features**:
  - Hourly automated checks for due invoices across all tenants
  - Support for monthly, quarterly, and yearly generation frequencies
  - Tenant-specific timezone support (UTC, EST, PST, etc.)
  - Weekend generation preferences with automatic business day rescheduling
  - Integration with existing invoice generation logic for consistency
  - Comprehensive audit logging with 'completed' status tracking
  - Robust error handling and automatic retry mechanisms
- **Technical Implementation**:
  - `server/invoiceScheduler.js`: Main cron job scheduler with timezone-aware logic
  - `server/index.ts`: Scheduler initialization during server startup
  - Uses existing `generateInvoiceForTenant` function for consistency
  - Automatic next generation date calculation based on frequency
  - Proper status logging with 'completed' for successful runs and 'failed' for errors
- **Production Deployment**: System runs automatically on server startup and performs hourly checks at minute 0
- **Architecture**: Maintains separation of concerns with centralized invoice generation logic and scheduler orchestration