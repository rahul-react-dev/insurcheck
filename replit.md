# Overview
InsurCheck is a multi-tenant SaaS insurance management platform. It's designed as a monorepo, featuring separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. The platform aims to provide a comprehensive solution for insurance management, including user management, subscription handling, payment processing, and invoice generation, with a focus on a professional and consistent user experience.

## Recent Changes (August 20, 2025)
✅ **System Configuration Module Fully Implemented & Tested** - Successfully completed comprehensive system configuration management with all 4 CRUD endpoints working perfectly. Implemented complete backend-frontend integration with database synchronization:

**System Configuration API Endpoints ✅**
- GET /super-admin/system-config: Fetch all configurations grouped by category
- POST /super-admin/system-config: Create new configuration entries
- PUT /super-admin/system-config/:key: Update existing configuration values
- DELETE /super-admin/system-config/:key: Soft delete configuration entries

**Database Implementation ✅**
- Created system_config table with proper schema (id, key, value, category, description)
- Implemented JSONB value storage for flexible configuration types
- Added audit logging through activity_logs table for all configuration changes
- Database seeded with sample configurations for testing (storage, security, backup)

**Frontend Integration ✅**
- Redux Saga: Complete API integration with proper error handling
- API Client: All CRUD methods (getSystemConfig, updateSystemConfig, createSystemConfig, deleteSystemConfig)
- UI Components: ConfigurationSection, ConfigurationToggle, ConfigurationSelect ready for use
- Error handling and success notifications implemented

**Technical Infrastructure Status**
- Backend APIs: All 4 system config endpoints returning HTTP 200 with proper data ✅
- Database: PostgreSQL table created and operational with test data ✅
- Frontend: Redux sagas and API integration ready for UI testing ✅
- Authentication: Super admin role protection implemented ✅

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