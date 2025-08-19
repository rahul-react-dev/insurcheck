# Overview
InsurCheck is a multi-tenant SaaS insurance management platform. It's designed as a monorepo, featuring separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. The platform aims to provide a comprehensive solution for insurance management, including user management, subscription handling, payment processing, and invoice generation, with a focus on a professional and consistent user experience.

## Recent Changes (August 19, 2025)
✅ **Tenant Management Module Fully Functional** - Fixed subscription plan filter API mismatch, added comprehensive button loading states, implemented proper toast error handling for all operations (create, update, suspend, delete), enhanced modal submit buttons with spinners, added disabled states to table action buttons. All filtering functionality (tenant name, status, subscription plan, date range) working correctly.

✅ **Tenant States API Implementation** - Added missing `/api/tenant-states` endpoint with GET and PUT operations, comprehensive filtering support (tenantName, status, subscriptionPlan, date ranges), pagination, proper error handling, and enriched response data including state information, storage usage, and activity tracking.

✅ **Tenant States Frontend Issues Fixed** - Fixed critical PUT request ID issue (was sending undefined), enhanced server validation for status-only updates, added skeleton loaders for cards and table, updated summary data mapping to display actual counts in cards, fixed all filter functionality (subscription status, trial status working correctly), and resolved table data mapping issues.

✅ **Activity Logs Module Fully Operational** - Fixed critical field mapping issues, resolved "NaN" status display, corrected spinner behavior on filter buttons, implemented comprehensive API field mappings with proper actionPerformed, status, logId, and userType fields. All filtering functionality (tenant name, user email, action performed, date range) working correctly with proper loading states and error handling.

✅ **Invoice Generation System Fully Functional** - Fixed critical date conversion API errors, resolved Redux saga response handling, implemented complete invoice configuration and generation features with real-time data integration, pagination, and status filtering.

✅ **Architecture Note** - This project requires separate startup processes: backend runs with `npm run dev` (port 5000), while frontend clients require separate commands: `cd client-admin && npm run dev` for admin interface.

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