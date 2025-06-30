# 🚀 Quick Deploy Instructions

Your project is ready! Git repository is initialized and committed.

## Manual GitHub Push (5 minutes)

1. **Create repository on GitHub.com**:
   - Go to https://github.com/new
   - Repository name: `german-odoo-directory`
   - Make it Public
   - Don't initialize with README

2. **Push your code**:
```bash
cd /home/eugen/Odoo\ 2.0/odoo-directory
git remote add origin https://github.com/YOUR_USERNAME/german-odoo-directory.git
git push -u origin main
```

3. **Deploy to DigitalOcean**:
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Choose GitHub → Select your repo
   - App Info: Name it `german-odoo-directory`
   - Resources: Keep as Static Site (FREE!)
   - Environment Variables:
     ```
     SUPABASE_URL = https://coaqbzaadmujuewxfhel.supabase.co
     SUPABASE_ANON_KEY = [copy from your .env file]
     ```
   - Info: Build Command = `npm install && npm run build`
   - Info: Output Directory = `dist`
   - Click "Create Resources"

## That's it! 🎉

Your site will be live in ~5 minutes at:
`https://german-odoo-directory-xxxxx.ondigitalocean.app`

## Current Status:
- ✅ 71/129 articles have hero images (55%)
- ✅ All files committed to git
- ✅ Ready for deployment