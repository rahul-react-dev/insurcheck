# Overview
InsurCheck is a multi-tenant SaaS insurance management platform providing a comprehensive solution for insurance management. It features separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. Key capabilities include user management, subscription handling, payment processing, invoice generation, and compliance analytics. The platform aims for a professional and consistent user experience.

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

# Recent Changes & Status

## ✅ Authentication System Fixed - Multi-Tab Support Working
**Issue Resolved**: Super Admin & Tenant Admin simultaneous access now fully functional
- **Root Cause**: Token storage key mismatch between super admin (`'token'`) and API calls (`'adminToken'`)
- **Fix Applied**: Updated `superAdminSlice.js` to use unified `'adminToken'` localStorage key
- **Backend**: Standardized all routes to use `authMiddleware` and role-based middleware
- **Status**: Multi-tab authentication working for both super admin and tenant admin roles

## ✅ Missing API Routes Completely Restored
**Issue Resolved**: All super admin API "not found" errors fixed
- **Routes Added**: `/api/invoices/config`, `/api/invoices/logs`, `/api/documents/deleted`
- **Strategy**: Route aliases pointing to existing proven endpoints:
  - `invoices/config` → `super-admin/invoice-config` 
  - `invoices/logs` → `super-admin/invoice-logs`
  - `documents/deleted` → `deleted-documents`
- **Additional Routes**: `/api/config`, `/api/system-config`, `/api/analytics`, `/api/analytics/detailed`
- **Security**: All routes properly secured with authentication and role-based access control
- **Compatibility**: Zero impact on existing admin or tenant admin functionality

## ✅ Core Features Status
- **Admin Invoices Management**: Fully functional with CRUD, filtering, search, export, payment processing
- **Notification Templates**: Complete with template editor, preview, audit logging, all user stories implemented
- **Super Admin Dashboard**: All API endpoints working, system metrics, activity logs, tenant management
- **Multi-Tenant Authentication**: JWT-based with proper role isolation and simultaneous session support

## Current System State
- **Backend**: Express.js server running on port 5000 with full API coverage
- **Database**: PostgreSQL with Drizzle ORM, multi-tenant schema with proper security
- **Authentication**: JWT-based with unified token storage and role-based access control
- **Frontend**: React applications (client-admin, client-user) with Redux state management
- **All Features**: Working and tested - ready for production deployment