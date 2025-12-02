#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         MORGEN - Git & Docker Hub Push Script             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track overall success
GIT_SUCCESS=false
DOCKER_SUCCESS=false

# ============================================
# PART 1: GIT PUSH
# ============================================
echo -e "${YELLOW}📦 STEP 1: Pushing to GitHub...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${RED}❌ Git repository not initialized!${NC}"
    echo -e "${YELLOW}Run: git init${NC}"
else
    # Add all changes
    echo "Adding files..."
    git add .
    
    # Commit with timestamp
    COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Committing: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG" 2>&1 | tee /tmp/git_commit.log
    
    # Check if there were changes to commit
    if grep -q "nothing to commit" /tmp/git_commit.log; then
        echo -e "${YELLOW}⚠️  No changes to commit${NC}"
        GIT_SUCCESS=true
    else
        # Push to GitHub
        echo "Pushing to GitHub..."
        if git push origin main 2>&1 | tee /tmp/git_push.log; then
            if grep -q "Everything up-to-date" /tmp/git_push.log; then
                echo -e "${GREEN}✅ Git: Already up to date${NC}"
                GIT_SUCCESS=true
            elif grep -q "error\|fatal\|rejected" /tmp/git_push.log; then
                echo -e "${RED}❌ Git push failed!${NC}"
                echo -e "${YELLOW}Check the error above${NC}"
                GIT_SUCCESS=false
            else
                echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
                GIT_SUCCESS=true
            fi
        else
            echo -e "${RED}❌ Git push failed!${NC}"
            echo -e "${YELLOW}Possible issues:${NC}"
            echo "  - Remote repository not configured"
            echo "  - Authentication failed"
            echo "  - Network connection issue"
            GIT_SUCCESS=false
        fi
    fi
fi

echo ""

# ============================================
# PART 2: DOCKER HUB PUSH
# ============================================
echo -e "${YELLOW}🐳 STEP 2: Pushing to Docker Hub...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again${NC}"
    DOCKER_SUCCESS=false
else
    # Get Docker Hub username
    read -p "Enter your Docker Hub username: " DOCKER_USERNAME
    
    if [ -z "$DOCKER_USERNAME" ]; then
        echo -e "${RED}❌ Docker Hub username is required!${NC}"
        DOCKER_SUCCESS=false
    else
        echo ""
        echo "Building and pushing Docker images..."
        echo ""
        
        # Build and push client
        echo -e "${BLUE}Building client image...${NC}"
        if docker build -f Dockerfile.client.prod -t $DOCKER_USERNAME/morgen-client:latest . 2>&1 | tail -5; then
            echo -e "${GREEN}✅ Client image built${NC}"
            
            echo -e "${BLUE}Pushing client image...${NC}"
            if docker push $DOCKER_USERNAME/morgen-client:latest 2>&1 | grep -E "Pushed|digest:" | tail -2; then
                echo -e "${GREEN}✅ Client image pushed to Docker Hub${NC}"
            else
                echo -e "${RED}❌ Failed to push client image${NC}"
                DOCKER_SUCCESS=false
            fi
        else
            echo -e "${RED}❌ Failed to build client image${NC}"
            DOCKER_SUCCESS=false
        fi
        
        echo ""
        
        # Build and push server
        echo -e "${BLUE}Building server image...${NC}"
        if docker build -f Dockerfile.server.prod -t $DOCKER_USERNAME/morgen-server:latest . 2>&1 | tail -5; then
            echo -e "${GREEN}✅ Server image built${NC}"
            
            echo -e "${BLUE}Pushing server image...${NC}"
            if docker push $DOCKER_USERNAME/morgen-server:latest 2>&1 | grep -E "Pushed|digest:" | tail -2; then
                echo -e "${GREEN}✅ Server image pushed to Docker Hub${NC}"
                DOCKER_SUCCESS=true
            else
                echo -e "${RED}❌ Failed to push server image${NC}"
                DOCKER_SUCCESS=false
            fi
        else
            echo -e "${RED}❌ Failed to build server image${NC}"
            DOCKER_SUCCESS=false
        fi
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ============================================
# FINAL SUMMARY
# ============================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    PUSH SUMMARY                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$GIT_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ GitHub Push: SUCCESS${NC}"
else
    echo -e "${RED}❌ GitHub Push: FAILED${NC}"
fi

if [ "$DOCKER_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Docker Hub Push: SUCCESS${NC}"
else
    echo -e "${RED}❌ Docker Hub Push: FAILED${NC}"
fi

echo ""

if [ "$GIT_SUCCESS" = true ] && [ "$DOCKER_SUCCESS" = true ]; then
    echo -e "${GREEN}🎉 All pushes completed successfully!${NC}"
    exit 0
elif [ "$GIT_SUCCESS" = true ] || [ "$DOCKER_SUCCESS" = true ]; then
    echo -e "${YELLOW}⚠️  Partial success - some pushes failed${NC}"
    exit 1
else
    echo -e "${RED}❌ All pushes failed - please check the errors above${NC}"
    exit 1
fi
