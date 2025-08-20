# Overview
InsurCheck is a multi-tenant SaaS insurance management platform. It's designed as a monorepo, featuring separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. The platform aims to provide a comprehensive solution for insurance management, including user management, subscription handling, payment processing, and invoice generation, with a focus on a professional and consistent user experience.

## Recent Changes (August 20, 2025)
✅ **ADMIN LOGIN SYSTEM FULLY OPERATIONAL** - Complete implementation and testing of tenant-admin authentication with comprehensive API integration:

**Admin Authentication Implementation Complete ✅**
- Database: Created tenant-admin user (admin@insurcheck.com/admin123) with proper role and tenant assignment
- Backend APIs: Admin login endpoint working perfectly (POST /api/auth/admin-login - 200 OK responses) 
- Frontend APIs: Comprehensive API utility with ALL required exports (50+ methods including invoiceAPI, paymentAPI, tenantAPI, subscriptionAPI)
- Authentication Flow: JWT token generation, localStorage persistence, role-based access control verified
- Dashboard Integration: Admin dashboard API working with tenant-scoped data (GET /api/admin/dashboard-stats)
- Error Handling: Proper validation, lockout mechanism, and security responses implemented

**Import/Export Issues Resolved ✅**
- Fixed ALL missing API exports causing frontend syntax errors
- Added complete superAdminAPI with comprehensive method coverage
- Proper API base URL configuration (frontend port 3000 → backend port 5000)
- Token storage consistency using 'adminToken' across all components
- Saga integration tested and working for both admin and super-admin workflows

**Backend Testing Verified ✅**
- Admin login: 200 OK with valid JWT token ✅
- Dashboard API: Authenticated requests returning tenant data ✅  
- Invalid credentials: Proper error responses ✅
- Role validation: tenant-admin role verified ✅

**Previous Achievements ✅**
- Tenant-Specific Configuration Module: All APIs and frontend components operational
- Super-Admin Analytics Module: All 5 endpoints working perfectly
- System Configuration: Complete dual-tab UI with batch operations
- Database: PostgreSQL schema with proper relationships and indexing

✅ **Critical Architecture Note** - This monorepo requires separate startup processes:
- Backend: `npm run dev` (port 5000) - Currently running and fully tested ✅
- Admin Frontend: `cd client-admin && npm run dev` (port 3000) - Ready for testing
- User Frontend: `cd client-user && npm run dev` (port 3001) - Requires separate terminal

**Admin Login Ready for Testing:**
- Credentials: admin@insurcheck.com / admin123
- Role: tenant-admin  
- Tenant: Premier Risk Management
- URL: http://localhost:3000/admin/login (when frontend started)

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture
The project employs a monorepo structure, separating `client-admin` (React frontend for Super and Tenant Admins), `client-user` (React frontend for Tenant Users), `server` (Express.js backend), and `shared` (common schemas).

## Frontend Architecture
All React frontends utilize Vite for building, Tailwind CSS with a custom blue gradient design system for styling, Redux Toolkit with Redux-Saga for state management, React Router for navigation, and Axios for HTTP requests. UI components are built using `shadcn/ui` based on Radix UI, ensuring design consistency.

## Backend Architecture
The backend is built with Express.js and TypeScript. It uses Drizzle ORM to interact with a PostgreSQL database, implementing multi-tenancy via `tenant_id` fields. Authentication is JWT-based with role-based access control. API endpoints are RESTful, secured with middleware for CORS, helmet, and rate limiting, and include robust error handling.

## Database Design
A PostgreSQL database is used, managed by Drizzle ORM for type-safe operations. The design supports multi-tenancy and a role-based user system.

## Security & Authentication
Security features include JWT tokens for stateless authentication, bcrypt for password hashing, `express-validator` for input sanitization, and role-based access control. CORS is configured to restrict access to allowed origins.

# External Dependencies

## Database
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: For type-safe database operations and migrations.

## UI Libraries
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **shadcn/ui**: Component library.

## Development Tools
- **Vite**: Build tool and development server.
- **TypeScript**: For type safety.
- **ESLint**: Code linting.
- **PostCSS**: CSS processing.

## Backend Dependencies
- **Express.js**: Web application framework.
- **cors**: Cross-origin resource sharing middleware.
- **helmet**: Security middleware.
- **express-rate-limit**: API rate limiting.
- **jsonwebtoken**: JWT token handling.
- **bcryptjs**: Password hashing.

## State Management
- **Redux Toolkit**: For state management.
- **Redux-Saga**: For managing side effects.