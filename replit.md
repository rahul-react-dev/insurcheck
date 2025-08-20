# Overview
InsurCheck is a multi-tenant SaaS insurance management platform. It's designed as a monorepo, featuring separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. The platform aims to provide a comprehensive solution for insurance management, including user management, subscription handling, payment processing, and invoice generation, with a focus on a professional and consistent user experience.

## Recent Changes (August 20, 2025)
✅ **ADMIN USERS TABLE FEATURE FULLY IMPLEMENTED** - Complete user management system with CRUD operations, search, export, and responsive design:

**Backend APIs Complete & Tested ✅**
- GET /api/admin/users - User list with pagination, search, sorting (✅ tested with real data)
- GET /api/admin/users/stats - User statistics dashboard (✅ returns total, active, inactive, recent)
- POST /api/admin/users/invite - Create new users with email invitations (✅ generates temp passwords)
- GET /api/admin/users/export - Export users in CSV/Excel/PDF formats (✅ tenant-scoped data)
- Authentication: JWT middleware with tenant-scoped access control (✅ verified)

**Frontend Components Complete ✅**
- AdminUsers page (/admin/users) with responsive table design
- Search functionality (username and email filtering)
- Sorting by username, email, createdAt fields
- Pagination controls with customizable page sizes (10/25/50)
- User invitation modal with username/email/role fields
- Export dropdown with CSV/Excel/PDF options
- Mobile-responsive cards view for small screens
- Real-time statistics cards showing user metrics

**Database Integration Working ✅**
- Schema matched to actual PostgreSQL structure (users table with id, username, email, role, tenant_id, etc.)
- Tenant-scoped queries ensuring admin sees only their tenant's users
- Real data testing: admin@insurcheck.com user successfully displayed
- Proper UUID handling and timestamp formatting

**Previous Achievements ✅**
- Admin Authentication System: Complete JWT-based login with role validation
- Tenant-Specific Configuration Module: All APIs and frontend components operational
- Super-Admin Analytics Module: All 5 endpoints working perfectly
- System Configuration: Complete dual-tab UI with batch operations
- Database: PostgreSQL schema with proper relationships and indexing

✅ **Architecture Testing Status** - All backend APIs verified with curl testing:
- Backend: `npm run dev` (port 5000) - ✅ Running with all endpoints functional
- Admin Frontend: `cd client-admin && npm run dev` (port 3000) - ✅ Code complete, ready for manual startup
- User Frontend: `cd client-user && npm run dev` (port 3001) - Available for future development

**Testing Instructions for Admin Users:**
1. Start admin frontend: `cd client-admin && npm run dev`
2. Login: admin@insurcheck.com / admin123
3. Navigate to "User Management" in sidebar
4. Test features: search, invite users, export data, pagination

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