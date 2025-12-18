# Deploying to Render

This guide will help you deploy AstraSemi Assistant to Render.

## Prerequisites

- A Render account (free tier works)
- OpenAI API key
- GitHub repository (optional, but recommended)

## Step-by-Step Deployment

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Create a PostgreSQL Database**
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `astrasemi-db`
   - Plan: Free
   - Region: Choose closest to you
   - Click "Create Database"
   - Copy the **Internal Database URL** (you'll need this)

2. **Create a Web Service**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository (or deploy from public Git URL)
   - Configure:
     - **Name**: `astrasemi-assistant`
     - **Environment**: `Node`
     - **Build Command**: `cp prisma/schema.postgresql.prisma prisma/schema.prisma && npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Set Environment Variables**
   Add these in the Render dashboard:
   ```
   DATABASE_URL=<your-postgresql-internal-database-url>
   SESSION_SECRET=<generate-random-string-here>
   OPENAI_API_KEY=<your-openai-api-key>
   NODE_ENV=production
   ```
   
   To generate SESSION_SECRET:
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Wait for deployment to complete (5-10 minutes)

5. **Seed the Database**
   After first deployment, run the seed command:
   - Go to your service → Shell
   - Run: `npx prisma db seed`
   - Or use Render's shell/SSH feature

### Option 2: Deploy using render.yaml

If you have `render.yaml` in your repo:

1. **Create PostgreSQL Database** (same as Option 1, step 1)

2. **Create Blueprint**
   - Go to Render Dashboard → New → Blueprint
   - Connect your repository
   - Render will detect `render.yaml` and configure everything automatically

3. **Update Environment Variables**
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `SESSION_SECRET` (generate random string)
   - Set `OPENAI_API_KEY`

## Post-Deployment

### Seed the Database

After deployment, you need to seed the database with initial data:

1. Go to your web service on Render
2. Click "Shell" tab
3. Run:
   ```bash
   npx prisma db seed
   ```

This creates:
- Admin user: `admin` / `admin`
- Demo users: `alice`, `bob`, `charlie`, `diana`, `eve` (password: `password123`)

### Access Your App

Your app will be available at:
```
https://astrasemi-assistant.onrender.com
```
(URL will be different based on your service name)

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string from Render | Yes |
| `SESSION_SECRET` | Random secret for session tokens | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NODE_ENV` | Set to `production` | Yes |

## Troubleshooting

### Database Connection Issues
- Make sure you're using the **Internal Database URL** (not External)
- Check that the database is in the same region as your web service

### Build Failures
- Check build logs in Render dashboard
- Ensure all environment variables are set
- Verify Node.js version (should be 18+)

### Migration Issues
- Run `npx prisma migrate deploy` manually in Shell
- Check Prisma logs for errors

### Seed Not Working
- Make sure database is created and accessible
- Run seed command manually in Shell: `npx prisma db seed`

## Updating the App

Render automatically redeploys when you push to your connected branch (usually `main`).

To manually trigger a redeploy:
1. Go to your service
2. Click "Manual Deploy"
3. Select branch and deploy

## Notes

- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for always-on service
- Database backups are automatic on paid plans

