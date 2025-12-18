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

3. **Set up Prisma and database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
   This will:
   - Create the SQLite database (`dev.db`)
   - Run migrations to set up the schema
   - Seed the database with 6 roles and sample tasks

4. **Create environment file**
   Create a file named `.env.local` in the root directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL="file:./dev.db"
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

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

## API Routes

### Existing Routes (Modules 1-3)
- `POST /api/module1` - Processes CSV data
- `POST /api/module2` - Interprets text documents
- `POST /api/module3` - Identifies images

### New Routes (Role Briefing Hub)
- `GET /api/roles` - Get all roles
- `GET /api/tasks?roleId=...&status=...&priority=...` - Get tasks with optional filters
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update a task
- `POST /api/briefing` - Generate daily briefing for a role
- `GET /api/briefing/history?roleId=...` - Get briefing history

## Database Schema

The app uses SQLite with Prisma ORM. The schema includes:

- **Role**: User roles (HR, Admin, Process Engineer, etc.)
- **Task**: Tasks assigned to roles with priority, status, and due dates
- **BriefingLog**: History of generated briefings

See `prisma/schema.prisma` for full schema definition.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: SQLite with Prisma ORM
- **AI Provider**: OpenAI API (GPT-4o-mini for text, GPT-4o for vision)
- **CSV Parsing**: papaparse

## Environment Variables

Required in `.env.local`:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_URL` - Database connection string (default: `"file:./dev.db"`)

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
- Demo login uses localStorage (no real authentication)

## Built For

AstraSemi hackathon demo
