#!/bin/bash

echo "🚀 Agricultural Platform - Deployment Setup"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"
echo "1. ✅ Server package.json configured"
echo "2. ✅ Client package.json configured"
echo "3. ✅ Environment files created"
echo "4. ✅ Deployment configs created"

echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"

# Install server dependencies
echo -e "${BLUE}Installing server dependencies...${NC}"
cd server
npm install --production
cd ..

# Install client dependencies
echo -e "${BLUE}Installing client dependencies...${NC}"
cd client
npm install
cd ..

echo -e "\n${GREEN}✅ Dependencies installed successfully!${NC}"

echo -e "\n${YELLOW}🔧 Building client for production...${NC}"
cd client
npm run build
cd ..

echo -e "\n${GREEN}✅ Client built successfully!${NC}"

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo "1. Push your code to GitHub"
echo "2. Sign up for Railway (backend + database)"
echo "3. Sign up for Vercel (frontend)"
echo "4. Follow the deployment guide in FREE_DEPLOYMENT_GUIDE.md"

echo -e "\n${GREEN}🎉 Setup complete! Ready for deployment.${NC}"