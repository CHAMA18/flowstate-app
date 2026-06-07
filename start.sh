#!/bin/bash
set -e

echo "=== FlowState Start Script ==="

# Create database directory
mkdir -p /tmp/db
export DATABASE_URL="file:/tmp/db/custom.db"

# Push database schema
echo "Pushing database schema..."
npx prisma db push --skip-generate 2>&1 || echo "Warning: prisma db push had issues, continuing..."

# Copy static files if they don't exist in standalone
if [ ! -d ".next/standalone/.next/static" ]; then
  echo "Copying static files to standalone..."
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
fi

if [ ! -d ".next/standalone/public" ]; then
  echo "Copying public files to standalone..."
  cp -r public .next/standalone/ 2>/dev/null || true
fi

# Copy Prisma engine to standalone if needed
if [ -d "node_modules/.prisma" ] && [ ! -d ".next/standalone/node_modules/.prisma" ]; then
  echo "Copying Prisma client to standalone..."
  mkdir -p .next/standalone/node_modules/.prisma
  cp -r node_modules/.prisma/client .next/standalone/node_modules/.prisma/ 2>/dev/null || true
fi

echo "Starting server on port $PORT..."
cd .next/standalone
exec node server.js
