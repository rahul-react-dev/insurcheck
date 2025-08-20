# Overview
InsurCheck is a multi-tenant SaaS insurance management platform. It's designed as a monorepo, featuring separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. The platform aims to provide a comprehensive solution for insurance management, including user management, subscription handling, payment processing, and invoice generation, with a focus on a professional and consistent user experience.

## Recent Changes (August 20, 2025)
✅ **System Configuration Save Button Optimization Complete** - Successfully implemented single batch API to reduce complexity and improve performance for save operations:

**Save Button Optimization ✅**
- Single batch API: PUT /super-admin/system-config/batch replacing multiple individual API calls
- Reduced API calls from 8+ separate requests to 1 single batch request
- Performance improvement: 8x reduction in network overhead and database transactions
- Maintains all existing functionality without any UI changes required

**Batch API Implementation ✅**
- Route positioned correctly before /:key route to prevent conflicts
- Handles multiple configuration updates in single database transaction
- Proper validation for each configuration update in batch
- Maintains individual audit logging for each changed setting
- Supports both create and update operations within single batch

**Testing Results ✅**
- End-to-end testing confirmed: 8/8 configuration changes properly saved
- Database verification: All form toggles and input fields correctly persisted
- Frontend integration: Redux saga updated to use batchUpdateSystemConfig API
- Error handling: Comprehensive validation and user feedback maintained

**System Configuration Module Status (Completed)**
- Backend APIs: All 5 system config endpoints operational (GET, POST, PUT, BATCH PUT, DELETE) ✅
- Database: PostgreSQL table with 13+ configurations across 5 categories ✅
- Frontend: Complete UI form with all toggles, inputs, and save functionality ✅
- Authentication: Super admin role protection implemented ✅
- Performance: Optimized from multiple API calls to single batch operation ✅

**Previous Achievements ✅**
- Super-Admin Analytics Module: All 5 endpoints working perfectly
- Fixed analyticsSaga.js import errors and database query issues
- Corrected tenant_id vs tenantId schema alignment across all modules

✅ **Critical Architecture Note** - This monorepo requires separate startup processes:
- Backend: `npm run dev` (port 5000) - Currently running ✅
- Admin Frontend: `cd client-admin && npm run dev` (port 3000) - Requires separate terminal
- User Frontend: `cd client-user && npm run dev` (port 3001) - Requires separate terminal

The backend serves APIs only; frontends must be started independently for UI testing.

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