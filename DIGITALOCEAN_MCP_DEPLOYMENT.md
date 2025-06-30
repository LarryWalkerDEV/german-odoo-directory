# 🚀 DigitalOcean MCP Deployment Instructions

## Important Note

The DigitalOcean MCP must be used from within **Claude Desktop**, not the web interface. Make sure you have:

1. ✅ Added the MCP configuration to Claude Desktop settings
2. ✅ Restarted Claude Desktop
3. ✅ The DigitalOcean MCP showing in your MCP servers list

## Step 1: Push to GitHub

First, create a GitHub repository:

```bash
cd /home/eugen/Odoo\ 2.0/odoo-directory

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - German Odoo Directory"

# Create GitHub repo (if you have gh CLI)
gh repo create german-odoo-directory --public --push

# Or manually create on GitHub and push:
git remote add origin https://github.com/YOUR_USERNAME/german-odoo-directory.git
git push -u origin main
```

## Step 2: Deploy Using Claude Desktop

Open Claude Desktop and use these commands:

### 1. List your current apps (to test MCP is working):
```
List all my DigitalOcean apps
```

### 2. Create the app:
```
Create a new DigitalOcean app named "german-odoo-directory" from my GitHub repo YOUR_USERNAME/german-odoo-directory using the smallest instance size in the Frankfurt region
```

### 3. Set environment variables:
```
Update the german-odoo-directory app with these environment variables:
- SUPABASE_URL = https://coaqbzaadmujuewxfhel.supabase.co
- SUPABASE_ANON_KEY = [your anon key]
```

### 4. Check deployment status:
```
Show me the deployment logs for german-odoo-directory
```

### 5. Get the app URL:
```
What's the URL for my german-odoo-directory app?
```

## Alternative: Manual Deployment via DigitalOcean Dashboard

If MCP isn't working, use the DigitalOcean App Platform dashboard:

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose "GitHub" as source
4. Select your repository: `german-odoo-directory`
5. Configure:
   - Name: `german-odoo-directory`
   - Region: Frankfurt (fra)
   - Branch: main
   - Type: Static Site
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
6. Choose plan: Starter ($0/month for static sites)
7. Add environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
8. Click "Create Resources"

## What I've Prepared

1. **app.yaml** - DigitalOcean App Platform configuration
2. **Dockerfile** - Container configuration for deployment
3. **nginx.conf** - Optimized nginx configuration
4. **.do/app.yaml** - Alternative app configuration

## Deployment Options

### Option 1: Static Site (Recommended - FREE)
- No monthly cost
- Automatic SSL
- Global CDN
- Perfect for your static HTML/CSS/JS site

### Option 2: Container (If needed later)
- $5/month minimum
- More control
- Can add backend services
- Uses the Dockerfile provided

## After Deployment

1. **Custom Domain**:
```
Add custom domain deutsche-odoo-experten.de to the german-odoo-directory app
```

2. **Check logs**:
```
Show me the latest logs for german-odoo-directory
```

3. **Monitor**:
```
Show me the metrics for german-odoo-directory
```

## Troubleshooting

If deployment fails:

1. Check build logs:
```
Download the build logs for the last deployment of german-odoo-directory
```

2. Verify environment variables are set correctly
3. Ensure all files are committed to GitHub
4. Check that npm build completes successfully locally

## Current Status

- ✅ All deployment files prepared
- ✅ Static site built and ready
- ✅ Nginx configuration optimized
- ✅ Environment variables configured
- 📊 Image generation: 63/129 articles (48.8%)

Your site is ready for deployment! Use Claude Desktop with the DigitalOcean MCP to deploy in minutes.