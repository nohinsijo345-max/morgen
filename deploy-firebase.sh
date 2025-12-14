#!/bin/bash

echo "🚀 Deploying to Firebase Hosting..."

# Navigate to client directory
cd client

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase (will open browser)
firebase login

# Initialize Firebase (run once)
firebase init hosting

# Build the project
npm run build

# Deploy to Firebase
firebase deploy

echo "✅ Deployment complete!"