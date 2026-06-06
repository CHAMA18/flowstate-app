#!/usr/bin/env bash
set -e

# ============================================================
# FlowState — One-Command Firebase Setup & Deploy
# ============================================================
# 
# Run this script from your local machine:
#   curl -sL <repo-url>/setup-firebase.sh | bash
# 
# Or clone and run:
#   ./setup-firebase.sh
# ============================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}🔥 FlowState — Firebase Setup & Deploy${NC}"
echo "========================================="
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi
echo "  ✅ Node.js $(node -v)"

if ! command -v bun &> /dev/null; then
    echo "  ⚠️  Bun not found. Installing..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi
echo "  ✅ Bun installed"

if ! command -v firebase &> /dev/null; then
    echo "  ⚠️  Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi
echo "  ✅ Firebase CLI $(firebase --version)"

echo ""

# Step 2: Firebase Authentication
echo -e "${YELLOW}Step 2: Firebase Authentication${NC}"

if ! firebase projects:list &> /dev/null 2>&1; then
    echo "  You need to log in to Firebase. Opening browser..."
    firebase login
fi
echo "  ✅ Firebase authenticated"

echo ""

# Step 3: Enable required services
echo -e "${YELLOW}Step 3: Enabling Firebase services...${NC}"
echo "  Make sure the following are enabled in Firebase Console:"
echo "  → https://console.firebase.google.com/project/hoocar-8806f"
echo ""
echo "  Required:"
echo "    • Hosting (Build → Hosting → Get started)"
echo "    • Authentication (Build → Authentication → Sign-in method: Email/Password + Google)"
echo "    • Firestore (Build → Firestore Database → Create database)"
echo ""
read -p "  Press Enter when you've enabled these services..."

echo ""

# Step 4: Install dependencies
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
bun install
echo "  ✅ Dependencies installed"

echo ""

# Step 5: Build
echo -e "${YELLOW}Step 5: Building application...${NC}"
bun run db:generate
bun run build
echo "  ✅ Build complete"

echo ""

# Step 6: Deploy
echo -e "${YELLOW}Step 6: Deploying to Firebase Hosting...${NC}"
firebase deploy --project hoocar-8806f

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "  🌐 Your app is now live at:"
echo "     https://hoocar-8806f.web.app"
echo "     https://hoocar-8806f.firebaseapp.com"
echo ""
echo "  📊 Firebase Console:"
echo "     https://console.firebase.google.com/project/hoocar-8806f"
echo ""
