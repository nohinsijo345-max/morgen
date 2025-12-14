#!/bin/bash

echo "🚀 Deploying Agricultural Platform to Surge.sh..."

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Install surge globally if not installed
echo "⚡ Installing Surge.sh..."
npm install -g surge

# Create CNAME file for custom domain (optional)
echo "morgen-farm.surge.sh" > dist/CNAME

# Deploy to surge
echo "🌐 Deploying to Surge.sh..."
surge dist/ morgen-farm.surge.sh

echo "✅ Deployment complete!"
echo "🌍 Your app is live at: https://morgen-farm.surge.sh"