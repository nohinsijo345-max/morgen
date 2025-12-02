#!/bin/bash

# Docker Hub Push Script for Morgen Project
# Replace YOUR_DOCKERHUB_USERNAME with your actual Docker Hub username

echo "🐳 Morgen - Docker Hub Push Script"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Prompt for Docker Hub username
read -p "Enter your Docker Hub username: " DOCKERHUB_USERNAME

if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo "❌ Username cannot be empty"
    exit 1
fi

echo ""
echo "📝 Using Docker Hub username: $DOCKERHUB_USERNAME"
echo ""

# Check if logged in
echo "🔐 Checking Docker Hub login status..."
if ! docker info 2>&1 | grep -q "Username"; then
    echo "⚠️  Not logged in to Docker Hub"
    echo "Please login now:"
    docker login
    if [ $? -ne 0 ]; then
        echo "❌ Login failed"
        exit 1
    fi
fi

echo "✅ Logged in to Docker Hub"
echo ""

# Tag images
echo "🏷️  Tagging images..."
docker tag morgen-server:latest $DOCKERHUB_USERNAME/morgen-server:latest
docker tag morgen-client:latest $DOCKERHUB_USERNAME/morgen-client:latest

echo "✅ Images tagged"
echo ""

# Push server image
echo "📤 Pushing server image..."
echo "   This may take a few minutes (223MB)..."
docker push $DOCKERHUB_USERNAME/morgen-server:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to push server image"
    exit 1
fi

echo "✅ Server image pushed"
echo ""

# Push client image
echo "📤 Pushing client image..."
echo "   This may take a few minutes (349MB)..."
docker push $DOCKERHUB_USERNAME/morgen-client:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to push client image"
    exit 1
fi

echo "✅ Client image pushed"
echo ""

# Success message
echo "🎉 Success! Images pushed to Docker Hub"
echo ""
echo "📦 Your images are now available at:"
echo "   https://hub.docker.com/r/$DOCKERHUB_USERNAME/morgen-server"
echo "   https://hub.docker.com/r/$DOCKERHUB_USERNAME/morgen-client"
echo ""
echo "🚀 Anyone can now pull your images with:"
echo "   docker pull $DOCKERHUB_USERNAME/morgen-server:latest"
echo "   docker pull $DOCKERHUB_USERNAME/morgen-client:latest"
echo ""
echo "✅ Done!"
