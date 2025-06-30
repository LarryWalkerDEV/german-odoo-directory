#!/bin/bash

echo "🚀 German Odoo Directory - GitHub Setup"
echo "====================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${BLUE}Initializing git repository...${NC}"
    git init
    git branch -M main
fi

# Check for existing remote
if git remote get-url origin &>/dev/null; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
    REMOTE_URL=$(git remote get-url origin)
    echo "Current remote: $REMOTE_URL"
    echo ""
    read -p "Do you want to use this remote? (y/n): " USE_EXISTING
    if [ "$USE_EXISTING" != "y" ]; then
        git remote remove origin
    fi
fi

# Get GitHub username
if [ -z "$GITHUB_USERNAME" ]; then
    read -p "Enter your GitHub username: " GITHUB_USERNAME
fi

# Repository name
REPO_NAME="german-odoo-directory"

# Add all files
echo -e "${BLUE}Adding files to git...${NC}"
git add .

# Commit
echo -e "${BLUE}Creating commit...${NC}"
git commit -m "Initial commit - German Odoo Directory

- Complete static site with 129 blog articles
- Supabase integration for data
- Professional Grove.ai design aesthetic
- SEO optimized for German market
- Image generation system with DALL-E 3"

# Create repository using GitHub CLI if available
if command -v gh &> /dev/null; then
    echo -e "${BLUE}Creating GitHub repository using GitHub CLI...${NC}"
    gh repo create $REPO_NAME --public --source=. --remote=origin --push
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Repository created and pushed successfully!${NC}"
        REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    else
        echo -e "${RED}❌ Failed to create repository with GitHub CLI${NC}"
        echo "Please create the repository manually on GitHub"
    fi
else
    echo -e "${YELLOW}GitHub CLI not found. Please install it for easier setup.${NC}"
    echo ""
    echo "Manual steps:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named: $REPO_NAME"
    echo "3. Make it public"
    echo "4. Don't initialize with README, .gitignore, or license"
    echo ""
    read -p "Press Enter after creating the repository..."
    
    # Add remote
    echo -e "${BLUE}Adding remote...${NC}"
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    
    # Push
    echo -e "${BLUE}Pushing to GitHub...${NC}"
    git push -u origin main
    
    REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME"
fi

# Create environment template
echo -e "${BLUE}Creating environment template...${NC}"
cat > .env.template << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
EOF

# Summary
echo ""
echo -e "${GREEN}✅ GitHub setup complete!${NC}"
echo ""
echo "Repository URL: $REPO_URL"
echo ""
echo "Next steps:"
echo "1. Go to DigitalOcean App Platform: https://cloud.digitalocean.com/apps"
echo "2. Click 'Create App'"
echo "3. Choose GitHub and select: $GITHUB_USERNAME/$REPO_NAME"
echo "4. Configure as Static Site:"
echo "   - Build Command: npm install && npm run build"
echo "   - Output Directory: dist"
echo "5. Add environment variables from your .env file"
echo ""
echo "Or use Claude Desktop with DigitalOcean MCP:"
echo "\"Create a DigitalOcean app from GitHub repo $GITHUB_USERNAME/$REPO_NAME\""