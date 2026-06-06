#!/bin/bash

# ============================================================
# FlowState — Firebase Hosting Quick Deploy
# ============================================================
# 
# This script deploys FlowState to Firebase Hosting.
# 
# OPTION 1: If you're already logged in to Firebase CLI:
#   ./deploy.sh
#
# OPTION 2: Using a CI token:
#   ./deploy.sh --token YOUR_FIREBASE_TOKEN
#
# To get a CI token, run: firebase login:ci
# ============================================================

set -e

TOKEN_FLAG=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --token) TOKEN_FLAG="--token $2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "🚀 FlowState — Firebase Deployment"
echo "===================================="
echo ""

# Check for Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install 2>/dev/null || npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
bun run db:generate 2>/dev/null || npx prisma generate

# Build Next.js
echo "🔨 Building Next.js application..."
bun run build 2>/dev/null || npm run build

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting (project: hoocar-8806f)..."
firebase deploy --project hoocar-8806f $TOKEN_FLAG

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is now live at:"
echo "   https://hoocar-8806f.web.app"
echo "   https://hoocar-8806f.firebaseapp.com"
