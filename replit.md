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