# Quick Start: Deploy to Render

## 🚀 Fastest Way to Deploy

### 1. Create PostgreSQL Database
- Render Dashboard → New → PostgreSQL
- Name: `astrasemi-db`
- Plan: Free
- Copy **Internal Database URL**

### 2. Create Web Service
- Render Dashboard → New → Web Service
- Connect your GitHub repo
- Settings:
  - **Build Command**: 
    ```
    cp prisma/schema.postgresql.prisma prisma/schema.prisma && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
    ```
  - **Start Command**: `npm start`

### 3. Set Environment Variables
```
DATABASE_URL=<your-postgresql-internal-url>
SESSION_SECRET=<generate-with-openssl-rand-base64-32>
OPENAI_API_KEY=<your-key>
NODE_ENV=production
```

### 4. Deploy & Seed
- Click "Create Web Service"
- Wait for build (5-10 min)
- Go to Shell tab
- Run: `npx prisma db seed`

### 5. Access Your App
Your app URL: `https://astrasemi-assistant.onrender.com`

**Login**: `admin` / `admin`

---

## 📋 What Was Prepared

✅ `render.yaml` - Blueprint configuration  
✅ `prisma/schema.postgresql.prisma` - PostgreSQL schema  
✅ `.env.example` - Environment variables template  
✅ `RENDER_DEPLOYMENT.md` - Detailed deployment guide  
✅ `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist  
✅ Build scripts configured  
✅ Node.js version specified (18+)  

## ⚠️ Important Notes

- **Database**: Uses PostgreSQL on Render (SQLite locally)
- **Schema Switch**: Build command automatically switches to PostgreSQL
- **Seeding**: Must run manually after first deployment
- **Free Tier**: Services spin down after 15 min inactivity

## 🆘 Need Help?

See `RENDER_DEPLOYMENT.md` for detailed instructions and troubleshooting.

