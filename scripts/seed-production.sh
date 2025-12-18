#!/bin/bash
# Seed script for production deployment (Render)
# Run this in Render Shell after deployment

echo "Seeding production database..."

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed

echo "✅ Database seeded successfully!"
echo "Admin: admin / admin"
echo "Demo users: alice, bob, charlie, diana, eve (password: password123)"

