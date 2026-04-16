# Agency CRM - Project Management for Digital Agencies

A production-ready CRM and project management system specifically designed for digital marketing and web agencies.

## Features

- **Multi-Tenant Architecture**: Complete data isolation per organization
- **JWT Authentication**: Secure access + refresh token system
- **Client Management**: Track client information and relationships
- **Lead Pipeline**: Kanban-style deal tracking with auto-conversion to projects
- **Project Management**: Service-specific project tracking (SEO, Web Dev, Social Media, Ads)
- **Task System**: Assign, track, and manage tasks with status workflows
- **Activity Logging**: Timeline view of calls, meetings, notes, and emails
- **Payment Tracking**: Monitor project revenue and payment status
- **Real-time Dashboard**: Key metrics and performance indicators
- **Role-Based Access**: Admin, Manager, and Team Member roles

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod schemas
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running locally or hosted
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/agency_crm?schema=public"
   JWT_ACCESS_SECRET="your-super-secret-access-key-change-this-in-production"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
   ACCESS_TOKEN_EXPIRY="15m"
   REFRESH_TOKEN_EXPIRY="7d"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # (Optional) Seed database with sample data
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main entities:

- **Organization**: Multi-tenant workspace
- **User**: Team members with roles (Admin, Manager, Member)
- **Client**: Client information and contact details
- **Project**: Projects linked to clients with service types
- **Task**: Tasks within projects with assignments
- **Deal**: Lead pipeline stages (Lead → Contacted → Proposal → Won/Lost)
- **Activity**: Activity logs (calls, meetings, notes, emails)
- **Payment**: Payment tracking for projects

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account and organization
- `POST /api/auth/login` - Sign in with email/password
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get client details
- `PATCH /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Deals (Lead Pipeline)
- `GET /api/deals` - List all deals
- `POST /api/deals` - Create new deal
- `PATCH /api/deals/[id]` - Update deal (auto-converts to project when marked WON)
- `DELETE /api/deals/[id]` - Delete deal

### Activities
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity log

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create new payment
- `PATCH /api/payments/[id]` - Update payment
- `DELETE /api/payments/[id]` - Delete payment

### Dashboard
- `GET /api/dashboard` - Get dashboard metrics and stats

### Users (Admin/Manager only)
- `GET /api/users` - List team members
- `POST /api/users` - Invite new team member

## Project Structure

```
CRM/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── clients/     # Client management
│   │   ├── projects/    # Project management
│   │   ├── tasks/       # Task management
│   │   ├── deals/       # Lead pipeline
│   │   ├── activities/  # Activity logging
│   │   ├── payments/    # Payment tracking
│   │   ├── dashboard/   # Dashboard metrics
│   │   └── users/       # User management
│   ├── dashboard/       # Dashboard pages
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── deals/
│   ├── login/           # Login page
│   ├── signup/          # Signup page
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/
│   ├── sidebar.tsx      # Navigation sidebar
│   └── dashboard-layout.tsx
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # Authentication utilities
│   ├── validations.ts   # Zod schemas
│   └── utils.ts         # Helper functions
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Key Workflows

### 1. Lead to Project Conversion
When a deal is marked as "WON" in the pipeline, it automatically converts to a project:
- A new project is created with the deal's title and value
- The deal is linked to the project
- An activity log is created for the conversion

### 2. Multi-Tenant Data Isolation
All queries automatically filter by `organizationId`:
- Users can only access data from their organization
- Strict separation between agency workspaces

### 3. Role-Based Access Control
- **Admin**: Full access to all features and user management
- **Manager**: Can manage clients, projects, tasks, and view team members
- **Member**: Can manage assigned tasks and view relevant data

## Security Features

- Password hashing with bcryptjs
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 days expiry)
- HTTP-only cookies for token storage
- Secure token rotation on refresh
- Input validation with Zod
- SQL injection prevention via Prisma

## Development

### Run Prisma Studio (Database GUI)
```bash
npx prisma studio
```

### Create a new migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset database (development only)
```bash
npx prisma migrate reset
```

## Production Deployment

1. **Set production environment variables** on your hosting platform
2. **Build the application**:
   ```bash
   npm run build
   ```
3. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```
4. **Start the production server**:
   ```bash
   npm start
   ```

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.
