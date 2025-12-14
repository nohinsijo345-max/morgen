#!/bin/bash

echo "🚀 Deploying to GitHub Pages..."

# Navigate to client directory
cd client

# Install gh-pages
npm install -g gh-pages

# Build the project
npm run build

# Deploy to GitHub Pages
gh-pages -d dist

echo "✅ Deployment complete!"
echo "🌍 Your app will be live at: https://nohinsijo345-max.github.io/morgen"