# Overview

InsurCheck is a multi-tenant SaaS insurance management platform built as a monorepo with separate React frontends for different user roles and a shared Node.js backend. The system supports three user types: Super Admins, Tenant Admins, and Tenant Users, each with their dedicated frontend application while sharing common backend services and database resources.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Monorepo Structure
The project follows a monorepo pattern with clear separation of concerns:
- **client-admin**: React frontend for Super Admins and Tenant Admins (run independently with `npm run dev`)
- **client-user**: React frontend for Tenant Users (run independently with `npm run dev`)  
- **server**: Express.js backend API (Port 5000, started via workflow)
- **shared**: Common schema and type definitions

## Development Workflow
- Backend: Run via "Start application" workflow (starts Express server on port 5000)
- Admin Frontend: `cd client-admin && npm run dev` (typically runs on port 3000)
- User Frontend: `cd client-user && npm run dev` (typically runs on port 3001)
- Each frontend runs independently and connects to the backend API
- **Important**: Backend and frontend run separately in development mode
- Backend serves API endpoints only; frontends must be started independently

## Frontend Architecture
All React frontends use a modern stack:
- **Build System**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system featuring blue gradient themes
- **State Management**: Redux Toolkit with Redux-Saga for side effects
- **Routing**: React Router for client-side navigation
- **HTTP Client**: Axios with interceptors for authentication and error handling
- **UI Components**: shadcn/ui component library for consistent design

The design system implements a professional blue color palette with CSS custom properties for theming consistency across all applications.

## Backend Architecture
- **Framework**: Express.js with TypeScript support
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with real data (tenants, users, activity_logs, documents, payments)
- **Authentication**: JWT-based authentication with role-based access control
- **Multi-tenancy**: Single database with tenant isolation via tenant_id fields
- **API Design**: RESTful endpoints with /api prefix
- **Middleware**: CORS, helmet for security, rate limiting, and comprehensive error handling
- **Test Credentials**: superadmin@insurcheck.com / admin123

## Current Status (August 18, 2025)
- ✅ Database schema deployed with all required tables  
- ✅ Sample data loaded (15 tenants, 8+ users, 15+ activity logs, documents, payments)
- ✅ All API endpoints working with real database data
- ✅ Authentication system functional
- ✅ System metrics API returning real data ($299.98 revenue, 15 error logs)
- ✅ Backend running independently on port 5000
- ✅ **Critical Database & API Issues Fixed (August 18, 2025)**:
  - Fixed missing subscription_plans table with 4 working plans (Basic, Professional, Enterprise, Starter)
  - Fixed missing email field in tenants table, updated all 15 tenants with email addresses
  - Fixed missing status field in tenants table, all tenants now have 'active' status
  - Fixed missing subscriptions table linking tenants to subscription plans
  - Resolved Drizzle ORM schema mismatches causing "column does not exist" errors
  - Fixed tenants API field selection issues that caused "Cannot convert undefined or null to object" errors
- ✅ **Subscription Plans API - Full CRUD Operations Working**:
  - CREATE: Add new subscription plans with validation
  - READ: Get all subscription plans with proper data
  - UPDATE: Modify existing subscription plans 
  - DELETE: Remove subscription plans (prevents deletion if in use)
- ✅ **Tenants API - Fixed and Working**:
  - Proper tenant listing with pagination
  - Search functionality by tenant name (case-insensitive)  
  - Status filtering (active, inactive, suspended, pending)
  - Enriched data showing subscription plan associations
- ✅ **Comprehensive Tenant Management System Completed (August 18, 2025)**:
  - Tenant Users API working perfectly (3 users per tenant with real data structure)
  - Complete filtering system: name, status, subscription plan, date range
  - Skeleton loading states for cards and tables matching dashboard design patterns
  - Redux store properly handling tenant users data with correct API response format
  - Edit, suspend, delete tenant actions fully implemented
  - Reusable pagination component consistent with super-admin design
  - All 15 tenants displaying with proper pagination (5 pages, 3 per page)
  - Real tenant users data (names, emails, phone numbers) from database
- ✅ **All Critical Tenant Management Issues Fixed (August 18, 2025)**:
  - Phone number display cleaned (removed UUID contamination with regex filtering)
  - Edit functionality implemented with prefilled modal data
  - Suspend button confirmation popup added (consistent with delete confirmation)
  - Delete confirmation shows proper tenant name instead of "undefined"
  - Filtering system fully functional (API confirmed: name, status, plan filters working)
  - Toast notification system implemented for all CRUD operations
  - Tenant users modal header shows correct tenant name
  - Both mobile and desktop views properly handle all actions

## Database Design
Uses PostgreSQL with Drizzle ORM providing:
- **Schema Management**: Type-safe schema definitions in shared directory
- **Multi-tenant Support**: Tenant isolation through tenant_id foreign keys
- **User Management**: Role-based user system (super-admin, tenant-admin, user)
- **Migration Support**: Drizzle Kit for database migrations

## Security & Authentication
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Role-based Access**: Three-tier permission system
- **Password Security**: bcrypt for password hashing
- **Request Validation**: express-validator for input sanitization
- **CORS Configuration**: Restricted to allowed origins with credentials support

# External Dependencies

## Database
- **PostgreSQL**: Primary database with connection pooling via @neondatabase/serverless
- **Drizzle ORM**: Type-safe database operations and migrations

## UI Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing with Tailwind CSS

## Backend Dependencies
- **Express.js**: Web application framework
- **cors**: Cross-origin resource sharing middleware
- **helmet**: Security middleware for HTTP headers
- **express-rate-limit**: API rate limiting
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing utility

## State Management
- **Redux Toolkit**: Modern Redux with reduced boilerplate
- **Redux-Saga**: Side effect management for async operations
- **TanStack Query**: Server state management for the main client application