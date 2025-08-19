# Overview
InsurCheck is a multi-tenant SaaS insurance management platform. It's designed as a monorepo, featuring separate React frontends for Super Admins, Tenant Admins, and Tenant Users, all powered by a shared Node.js backend. The platform aims to provide a comprehensive solution for insurance management, including user management, subscription handling, payment processing, and invoice generation, with a focus on a professional and consistent user experience.

## Recent Changes (August 19, 2025)
✅ **Deleted Documents Management Module Comprehensive Testing & Fixes Completed** - Conducted full end-to-end testing of all functionalities. Fixed critical pagination display issue showing "0 of 0" by correcting Redux state mapping. Enhanced table data mapping for proper column display (deletedBy, originalOwner, version fields). Added 7 comprehensive test documents spanning multiple file types (PDF, DOCX, XLSX, ZIP). All core functionalities verified working:

**API Level Testing ✅**
- Search functionality: Tested with "insurance" keyword (returns 2 docs)  
- Document type filtering: Tested PDF filter (returns 3 docs)
- Sorting: Tested name/date sorting (works correctly)
- Date range filtering: Tested March 2024 range (returns 5 docs)
- Pagination: Tested page size 3 (correctly shows 2 pages)
- Restore operation: Tested doc-4 restoration (successful)
- View/Download: Added missing API routes with proper responses
- Permanent delete: Added API route with validation

**Frontend Level Fixes ✅**
- Fixed Redux saga response mapping for proper pagination display
- Updated table component data field mapping (userEmail for originalOwner, deletedByEmail for deletedBy)
- Enhanced mobile responsive cards with correct data display  
- Fixed skeleton loading states and button spinners
- Updated version display with fallback values
- Corrected pagination component props and calculations

**Known Issues**
- Export functionality: Has Drizzle SQL query complexity issue (export route exists but needs simplification)

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