#!/bin/bash

# Morgen - Push to GitHub AND Docker Hub
# This script pushes code to GitHub and images to Docker Hub

echo "🚀 Morgen - Push to GitHub & Docker Hub"
echo "========================================"
echo ""

# Get commit message
if [ -z "$1" ]; then
    read -p "Enter commit message: " COMMIT_MSG
else
    COMMIT_MSG="$1"
fi

if [ -z "$COMMIT_MSG" ]; then
    echo "❌ Commit message cannot be empty"
    exit 1
fi

echo "📝 Commit message: $COMMIT_MSG"
echo ""

# ============================================
# PART 1: Push to GitHub
# ============================================

echo "📦 PART 1: Pushing to GitHub..."
echo "--------------------------------"

# Add all changes
echo "📁 Adding files..."
git add .

# Commit
echo "💾 Committing..."
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo "⚠️  Nothing to commit or commit failed"
    echo "Continuing to Docker Hub push..."
else
    echo "✅ Committed to Git"
fi

# Push to GitHub
echo "📤 Pushing to GitHub (dev branch)..."
git push origin dev

if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub"
    exit 1
fi

echo "✅ Pushed to GitHub"
echo ""

# ============================================
# PART 2: Push to Docker Hub
# ============================================

echo "🐳 PART 2: Pushing to Docker Hub..."
echo "-----------------------------------"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Skipping Docker Hub push."
    echo "✅ GitHub push completed successfully"
    exit 0
fi

# Get Docker Hub username
DOCKERHUB_USERNAME="nohinsijo"

# Check if logged in
if ! docker info 2>&1 | grep -q "Username"; then
    echo "⚠️  Not logged in to Docker Hub"
    echo "Please login:"
    docker login
    if [ $? -ne 0 ]; then
        echo "❌ Login failed. Skipping Docker Hub push."
        echo "✅ GitHub push completed successfully"
        exit 0
    fi
fi

# Rebuild images
echo "🏗️  Rebuilding Docker images..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Failed to build images"
    echo "✅ GitHub push completed successfully"
    exit 0
fi

echo "✅ Images rebuilt"

# Tag images
echo "🏷️  Tagging images..."
docker tag morgen-server:latest $DOCKERHUB_USERNAME/morgen-server:latest
docker tag morgen-client:latest $DOCKERHUB_USERNAME/morgen-client:latest

echo "✅ Images tagged"

# Push server image
echo "📤 Pushing server image..."
docker push $DOCKERHUB_USERNAME/morgen-server:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to push server image"
    echo "✅ GitHub push completed successfully"
    exit 0
fi

echo "✅ Server image pushed"

# Push client image
echo "📤 Pushing client image..."
docker push $DOCKERHUB_USERNAME/morgen-client:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to push client image"
    echo "✅ GitHub push completed successfully"
    exit 0
fi

echo "✅ Client image pushed"
echo ""

# ============================================
# SUCCESS
# ============================================

echo "🎉 SUCCESS! Pushed to both GitHub and Docker Hub"
echo ""
echo "📦 GitHub:"
echo "   https://github.com/nohinsijo345-max/morgen/tree/dev"
echo ""
echo "🐳 Docker Hub:"
echo "   https://hub.docker.com/r/$DOCKERHUB_USERNAME/morgen-server"
echo "   https://hub.docker.com/r/$DOCKERHUB_USERNAME/morgen-client"
echo ""
echo "✅ All done!"
