# AstraSemi Assistant

A production-ready, hackathon-simple web application for semiconductor operations staff. Built with Next.js 14, TypeScript, TailwindCSS, Prisma, and OpenAI API.

## Features

### Operations Overview Dashboard
- Upload CSV files and get AI-powered summaries
- View data preview (first 10 rows)
- Get main points, important items, top 3 attention items, and data quality notes

### Message Interpreter
- Paste technical documents for clear summaries
- Get key points explained for beginners
- Suggested follow-up actions
- Optional conversions to professional emails or manager-friendly updates

### Image Explainer
- Upload images to identify semiconductor components
- Get explanations of what objects are, their purpose, and role in the process
- Beginner-friendly language with appropriate disclaimers

### Role Briefing Hub
- Personalized daily briefings based on role and tasks
- Task management with status, priority, and due dates
- AI-powered briefings with fallback to rule-based summaries
- Track top 3 actions, alerts, blockers, and due/overdue items

### Community Forum (Module 4)
- Internal semiconductor discussion board (StackOverflow + Reddit style)
- Create posts with categories (Onboarding, Equipment, Process, Quality, Logistics, Safety, General)
- Upvote/downvote posts and answers
- Comment on posts with answers
- Search and filter posts by keyword, category, and date
- Sort by newest, top votes, or most commented
- Reputation system: +10 per upvote, -2 per downvote, +15 for accepted answers
- Top Contributors leaderboard
- Admin features: pin posts, lock posts, delete posts/comments, disable users

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "application v1"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a file named `.env.local` in the root directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET="your-long-random-secret-string-here"
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key.
   Generate a random string for `SESSION_SECRET` (e.g., use `openssl rand -base64 32`).

4. **Set up Prisma and database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
   This will:
   - Create the SQLite database (`dev.db`)
   - Run migrations to set up the schema
   - Seed the database with:
     - 6 roles and sample tasks
     - 1 admin user (username: `admin`, password: `admin`)
     - 5 demo users (usernames: `alice`, `bob`, `charlie`, `diana`, `eve`, all password: `password123`)

5. **Add company logo (optional)**
   Place your company logo at `public/logo.png`. The app will display it in the sidebar and Role Briefing Hub. If the logo is missing, it will fallback to "AstraSemi" text.

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── module1/          # CSV processing API
│   │   ├── module2/          # Document interpretation API
│   │   ├── module3/          # Image identification API
│   │   ├── roles/            # Roles API
│   │   ├── tasks/            # Tasks CRUD API
│   │   └── briefing/         # Briefing generation API
│   ├── dashboard/            # Operations Overview page
│   ├── interpreter/          # Message Interpreter page
│   ├── image-id/            # Image Explainer page
│   ├── role-briefing/        # Role Briefing Hub page
│   ├── optional/             # Redirects to role-briefing
│   ├── layout.tsx            # Root layout with sidebar
│   ├── page.tsx             # Landing page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── Sidebar.tsx           # Sidebar navigation
│   ├── Topbar.tsx            # Top header bar
│   ├── Logo.tsx              # Logo component with fallback
│   └── Footer.tsx            # Footer component
├── lib/
│   ├── utils.ts              # Utility functions
│   └── prisma.ts             # Prisma client singleton
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
└── package.json
```

## Authentication

The app now uses database-backed authentication with sessions.

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin`

### Demo User Credentials
- **Usernames**: `alice`, `bob`, `charlie`, `diana`, `eve`
- **Password**: `password123` (for all demo users)

### Login
- Regular users: Navigate to `/login`
- Admin users: Can also use `/login` (will redirect to `/admin` after login)

## Testing Each Module

### Operations Overview Dashboard
1. Navigate to `/dashboard` (or click "Ops Overview" in sidebar)
2. Create a sample CSV file with semiconductor operations data, for example:
   ```csv
   Date,Equipment,Status,Throughput,Defects
   2024-01-01,Wafer Handler A,Operational,1200,2
   2024-01-02,Wafer Handler A,Maintenance,0,0
   2024-01-03,Wafer Handler B,Operational,1150,1
   ```
3. Upload the CSV file
4. Click "Generate Summary"

### Message Interpreter
1. Navigate to `/interpreter` (or click "Message Interpreter" in sidebar)
2. Paste a technical document or notes, for example:
   ```
   The lithography process completed successfully with 98% yield. 
   Wafer alignment was within tolerance. Next step: etching process.
   ```
3. Click "Generate Summary"
4. Optionally convert to email or manager update

### Image Explainer
1. Navigate to `/image-id` (or click "Image Explainer" in sidebar)
2. Upload an image of a semiconductor component (wafer, chip, equipment, etc.)
3. Click "Identify & Explain"

### Role Briefing Hub
1. Navigate to `/role-briefing` (or click "Role Briefing Hub" in sidebar)
2. **Demo Login:**
   - Enter your name (optional)
   - Select a role from the dropdown (HR, Admin, Process Engineer, Equipment Engineer, Operations/Technician, Logistics/Driver)
   - Click "Enter"
3. **View Tasks:**
   - See all tasks assigned to your role
   - Filter by status (To Do, In Progress, Blocked, Done) or priority (Low, Medium, High, Critical)
   - Click on any task to edit it
   - Mark tasks as done with the checkmark button
4. **Create New Task:**
   - Click "New Task" button
   - Fill in title, description, priority, status, and due date
   - Click "Create"
5. **Generate Daily Briefing:**
   - Click "Generate Daily Briefing" in the right panel
   - View AI-powered insights including:
     - Top 3 actions for today
     - Critical alerts
     - Blocking dependencies
     - Due/overdue items
   - Briefings are saved to the database for history

### Community Forum (Module 4)
1. **Login as a user:**
   - Navigate to `/login`
   - Use demo credentials (e.g., `alice` / `password123`)
   - You'll be redirected to `/dashboard`

2. **Navigate to Community:**
   - Click "Community Forum" in the sidebar
   - Or go directly to `/community`

3. **Create a Post:**
   - Click "New Post" button
   - Enter title, content, and select a category
   - Categories: Onboarding, Equipment, Process, Quality, Logistics, Safety, General
   - Click "Create Post"

4. **Interact with Posts:**
   - Click on any post to view details and comments
   - Upvote/downvote posts using the chevron buttons
   - View vote scores and answer counts
   - See author reputation points

5. **Answer Posts:**
   - Open a post by clicking on it
   - Scroll to the answers section
   - Write your answer in the textarea
   - Click "Post Answer"
   - Post authors can accept answers (gives +15 reputation to answerer)

6. **Search and Filter:**
   - Use the search bar to find posts by keyword (searches title and content)
   - Filter by category using the dropdown
   - Sort by: Newest, Top (by votes), or Most Commented

7. **View Top Contributors:**
   - Check the right sidebar for the Top Contributors leaderboard
   - Shows users ranked by reputation points

8. **Admin Features (login as admin):**
   - Login with `admin` / `admin`
   - Navigate to `/admin` for admin dashboard
   - Can create users, disable users, delete posts, pin/lock posts

## API Routes

### Existing Routes (Modules 1-3)
- `POST /api/module1` - Processes CSV data
- `POST /api/module2` - Interprets text documents
- `POST /api/module3` - Identifies images

### Authentication Routes
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/me` - Get current user info

### Role Briefing Hub Routes
- `GET /api/roles` - Get all roles
- `GET /api/tasks?roleId=...&status=...&priority=...` - Get tasks with optional filters
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update a task
- `POST /api/briefing` - Generate daily briefing for a role
- `GET /api/briefing/history?roleId=...` - Get briefing history

### Community Forum Routes (Module 4)
- `GET /api/community/posts?search=...&category=...&sort=...` - Get posts with search/filter/sort
- `POST /api/community/posts` - Create a new post
- `GET /api/community/posts/:id` - Get post details with answers
- `POST /api/community/posts/:id/vote` - Vote on a post (+1 or -1)
- `POST /api/community/posts/:id/answers` - Add an answer to a post
- `PATCH /api/community/posts/:id/accept` - Accept an answer (post author only)
- `GET /api/community/contributors` - Get top contributors by reputation

### Admin Routes
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create a new user
- `PATCH /api/admin/users/:id` - Update user (disable/enable, change role)
- `DELETE /api/admin/posts/:id` - Delete a post
- `PATCH /api/admin/posts/:id` - Update post (pin/lock)

## Database Schema

The app uses SQLite with Prisma ORM. The schema includes:

- **User**: User accounts with username, password hash, role (ADMIN/USER), reputation, and active status
- **Session**: Active user sessions with tokens and expiration
- **Role**: User roles (HR, Admin, Process Engineer, etc.)
- **Task**: Tasks assigned to roles with priority, status, and due dates
- **BriefingLog**: History of generated briefings
- **Post**: Community forum posts with categories, votes, and answers
- **Answer**: Answers/comments on posts
- **Vote**: User votes on posts (+1 or -1)

See `prisma/schema.prisma` for full schema definition.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: SQLite (local) / PostgreSQL (production on Render)
- **AI Provider**: OpenAI API (GPT-4o-mini for text, GPT-4o for vision)
- **CSV Parsing**: papaparse

## Environment Variables

Required in `.env.local`:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_URL` - Database connection string (default: `"file:./dev.db"`)
- `SESSION_SECRET` - Secret key for session tokens (generate a random string)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma migrate dev` - Run database migrations
- `npx prisma db seed` - Seed the database
- `npx prisma studio` - Open Prisma Studio to view/edit database

## Company Logo

Place your company logo at `public/logo.png`. The logo will be displayed in:
- Sidebar navigation (top)
- Role Briefing Hub demo login card

If the logo file is missing, the app will automatically fallback to displaying "AstraSemi" text.

## Notes

- All file processing happens client-side (CSV parsing) or server-side (AI inference)
- Input validation and guardrails are implemented for safety
- Responses are beginner-friendly and action-oriented
- Technical diagnoses are avoided; the app redirects to consulting with experts
- Briefing generation uses AI with automatic fallback to rule-based summaries if AI fails
- Task data persists in SQLite database
- **Authentication**: Uses database-backed sessions with bcrypt password hashing
- **Community Module**: Full StackOverflow-style Q&A with voting, reputation, and moderation
- **Reputation System**: Users gain/lose reputation based on votes and accepted answers
- **Admin Features**: User management, post moderation (pin/lock/delete)

## Deployment to Render

This application is ready for deployment to Render.

**Quick Start**: See [QUICK_START_RENDER.md](./QUICK_START_RENDER.md)  
**Detailed Guide**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)  
**Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Quick Deploy Steps:

1. **Create PostgreSQL Database on Render**
   - New → PostgreSQL
   - Copy the Internal Database URL

2. **Create Web Service**
   - New → Web Service
   - Connect your repository
   - Build Command: `cp prisma/schema.postgresql.prisma prisma/schema.prisma && npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: Generate with `openssl rand -base64 32`
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`

4. **Seed Database**
   After deployment, run in Render Shell:
   ```bash
   npx prisma db seed
   ```

### Important Notes:

- **Database**: The app uses SQLite locally but PostgreSQL on Render
- **Schema**: The build process automatically switches to PostgreSQL schema
- **Free Tier**: Services spin down after 15 min inactivity (first request may be slow)
- **Seeding**: Must be done manually after first deployment

See `RENDER_DEPLOYMENT.md` for complete deployment guide.

## Built For

AstraSemi hackathon demo
