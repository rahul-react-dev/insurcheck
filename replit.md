# Overview

InsurCheck is a multi-tenant SaaS insurance management platform. It uses a monorepo structure with distinct React frontends for different user roles (Super Admins, Tenant Admins, and Tenant Users) and a shared Node.js backend. The platform provides comprehensive insurance management capabilities, including tenant and subscription management, payment processing, and invoice generation, all built on a robust and scalable architecture.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Monorepo Structure
The project is organized as a monorepo containing:
- `client-admin`: React frontend for Super Admins and Tenant Admins.
- `client-user`: React frontend for Tenant Users.
- `server`: Express.js backend API.
- `shared`: Common schema and type definitions.

## Development Workflow
The backend and frontends run independently during development:
- Backend: Started via a workflow (Port 5000).
- Frontends: `client-admin` (Port 3000) and `client-user` (Port 3001) are started separately.

## Frontend Architecture
All React frontends leverage:
- **Build System**: Vite.
- **Styling**: Tailwind CSS with a custom design system focusing on blue gradient themes and a professional color palette.
- **State Management**: Redux Toolkit with Redux-Saga.
- **Routing**: React Router.
- **HTTP Client**: Axios with interceptors.
- **UI Components**: shadcn/ui library, built on Radix UI.

## Backend Architecture
The backend is built with:
- **Framework**: Express.js with TypeScript.
- **Database ORM**: Drizzle ORM.
- **Database**: PostgreSQL.
- **Authentication**: JWT-based with role-based access control.
- **Multi-tenancy**: Single database with tenant isolation using `tenant_id`.
- **API Design**: RESTful endpoints, `/api` prefix.
- **Middleware**: CORS, helmet, rate limiting, error handling.

## Database Design
- **Type**: PostgreSQL with Drizzle ORM.
- **Features**: Type-safe schema definitions, multi-tenant support via `tenant_id`, role-based user management, and Drizzle Kit for migrations.

## Security & Authentication
- **Authentication**: JWT tokens with configurable expiration.
- **Access Control**: Three-tier role-based permission system.
- **Password Security**: bcrypt for hashing.
- **Input Validation**: `express-validator`.
- **CORS**: Configured for allowed origins.

# External Dependencies

## Database
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: For database operations and migrations.
- **@neondatabase/serverless**: For PostgreSQL connection pooling.

## UI Libraries
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **shadcn/ui**: Component library.

## Development Tools
- **Vite**: Build tool and development server.
- **TypeScript**: For type safety.
- **ESLint**: For code linting.
- **PostCSS**: For CSS processing.

## Backend Dependencies
- **Express.js**: Web framework.
- **cors**: CORS middleware.
- **helmet**: Security middleware.
- **express-rate-limit**: API rate limiting.
- **jsonwebtoken**: JWT handling.
- **bcryptjs**: Password hashing.

## State Management
- **Redux Toolkit**: For state management.
- **Redux-Saga**: For handling side effects.
- **TanStack Query**: For server state management (main client application).