# Render Deployment Checklist

Use this checklist to ensure your app is ready for Render deployment.

## Pre-Deployment

- [ ] All code is committed to Git repository
- [ ] Repository is connected to GitHub/GitLab/Bitbucket
- [ ] `.env.local` is NOT committed (should be in `.gitignore`)
- [ ] All environment variables documented in `.env.example`

## Render Setup

- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Create Web Service on Render
- [ ] Connect repository
- [ ] Set build command: `cp prisma/schema.postgresql.prisma prisma/schema.prisma && npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- [ ] Set start command: `npm start`

## Environment Variables

Set these in Render dashboard:

- [ ] `DATABASE_URL` - PostgreSQL connection string (from Render database)
- [ ] `SESSION_SECRET` - Random string (generate with `openssl rand -base64 32`)
- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `NODE_ENV` - Set to `production`

## Post-Deployment

- [ ] Wait for build to complete successfully
- [ ] Open Render Shell for your web service
- [ ] Run: `npx prisma db seed`
- [ ] Verify admin login works: `admin` / `admin`
- [ ] Test demo user login: `alice` / `password123`
- [ ] Test Community Forum features
- [ ] Test Admin Dashboard

## Verification

- [ ] App loads without errors
- [ ] Login works
- [ ] Database queries work
- [ ] Community Forum loads posts
- [ ] Can create posts
- [ ] Can vote on posts
- [ ] Admin dashboard shows users

## Troubleshooting

If something doesn't work:

1. **Check Build Logs** - Look for errors in Render dashboard
2. **Check Runtime Logs** - View application logs for runtime errors
3. **Verify Environment Variables** - Ensure all are set correctly
4. **Check Database Connection** - Verify DATABASE_URL is correct
5. **Run Migrations Manually** - In Shell: `npx prisma migrate deploy`
6. **Seed Database Manually** - In Shell: `npx prisma db seed`

## Common Issues

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies install correctly
- Check Prisma schema is valid

### Database Connection Fails
- Use Internal Database URL (not External)
- Ensure database is in same region as web service
- Check database is running

### Migrations Fail
- Run manually: `npx prisma migrate deploy`
- Check if migrations folder exists
- Verify DATABASE_URL is correct

### Seed Fails
- Run manually: `npx prisma db seed`
- Check database is accessible
- Verify seed script has correct permissions

