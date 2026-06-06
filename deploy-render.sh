#!/bin/bash
# FlowState Deployment Script for Render
# This script pushes the code to GitHub and triggers a Render deployment

set -e

echo "🚀 FlowState Deployment Script"
echo "==============================="

# Check if gh CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo ""
    echo "⚠️  GitHub CLI is not authenticated."
    echo "Please run: gh auth login"
    echo "Then re-run this script."
    exit 1
fi

# Create the GitHub repo if it doesn't exist
echo "📦 Creating GitHub repository..."
gh repo create CHAMA18/flowstate-app --public --source=. --push 2>/dev/null || {
    echo "Repository may already exist, pushing to it..."
    git push -u origin main --force
}

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Your FlowState app will be deployed at:"
echo "   https://flowstate-oqnu.onrender.com"
echo ""
echo "📊 Monitor the deployment at:"
echo "   https://dashboard.render.com/web/srv-d8i9ppcm0tmc73cf54q0"
echo ""
echo "🔄 To update the Render service repo, visit:"
echo "   https://dashboard.render.com/web/srv-d8i9ppcm0tmc73cf54q0/settings"
echo "   and change the Repository to: CHAMA18/flowstate-app"
