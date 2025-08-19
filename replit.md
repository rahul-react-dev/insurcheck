# Overview
InsurCheck is a multi-tenant SaaS insurance management platform. It's designed as a monorepo, featuring separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. The platform aims to provide a comprehensive solution for insurance management, including user management, subscription handling, payment processing, and invoice generation, with a focus on a professional and consistent user experience.

## Recent Changes (August 19, 2025)
✅ **System Configuration Management Module Fully Implemented** - Complete system-wide configuration management functionality with comprehensive testing across all layers. Built robust backend API with 22 sample configurations across 7 categories and implemented full frontend integration with advanced search and filtering capabilities.

**Backend API Implementation ✅**
- Complete CRUD operations: GET, POST, PUT, DELETE, and bulk update endpoints
- 22 sample configurations across 7 categories: security, storage, communication, maintenance, features, performance, audit
- Advanced search and filtering by category, key, description, and status
- Comprehensive error handling and validation using Zod schemas
- Real-time configuration updates with proper response formatting
- Bulk update operations for multiple configurations simultaneously

**Frontend Integration ✅**
- React components with proper Redux Toolkit integration using Redux-Saga
- SystemConfigTable component with advanced search and category filtering
- Real-time JSON value editing with validation and error handling
- Professional UI with skeleton loading states and responsive design
- Category-based color coding and status indicators (active/inactive)
- Mobile-responsive table with pagination and comprehensive error states

**Database Schema ✅**
- PostgreSQL system_config table with proper indexing and constraints
- JSONB value storage for flexible configuration data structures
- Audit trail with created_at and updated_at timestamps
- Category-based organization with unique key constraints

**Testing Verification ✅**
- All API endpoints tested: 22 configurations loaded, CRUD operations verified
- Search functionality: category filtering, key-based search, description search
- Real-time updates: configurations update immediately in frontend
- Error handling: proper validation and user feedback for all operations
- Performance: optimized queries and efficient Redux state management
- Redux saga integration: Fixed destructuring error and confirmed proper data flow
- Frontend routing: System configuration accessible at `/super-admin/system-config`

✅ **Architecture Note** - This project requires separate startup processes: backend runs with `npm run dev` (port 5000), while frontend clients require separate commands: `cd client-admin && npm run dev` (port 3000) for admin interface.

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