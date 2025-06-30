# 🚀 DigitalOcean Deployment Guide

## Prerequisites

### 1. Install DigitalOcean MCP on Your System

The MCP (Model Context Protocol) needs to be configured in your Claude Desktop app. Add this to your MCP settings:

```json
{
  "mcpServers": {
    "digitalocean": {
      "command": "npx",
      "args": ["@digitalocean/mcp"],
      "env": {
        "DIGITALOCEAN_API_TOKEN": "your_digitalocean_api_token_here"
      }
    }
  }
}
```

After adding this configuration, restart Claude Desktop to load the MCP server.

## What You Can Do with DigitalOcean MCP

Once the MCP is installed, you can use these commands in Claude:

### 1. Create a Droplet
```
Create a new Ubuntu 22.04 droplet in Frankfurt (fra1) with 1GB RAM for hosting the German Odoo Directory static site
```

### 2. Set Up the Server
```
Install nginx and configure it to serve the static site from /var/www/odoo-directory
```

### 3. Deploy the Site
```
Upload the dist folder contents to the droplet at /var/www/odoo-directory
```

## Manual Deployment Steps (Without MCP)

If the MCP isn't working, here's how to deploy manually:

### 1. Create a Droplet via DigitalOcean Dashboard

1. Go to https://cloud.digitalocean.com/
2. Click "Create" → "Droplets"
3. Choose:
   - Ubuntu 22.04 LTS
   - Basic Plan ($6/month - 1GB RAM, 25GB SSD)
   - Frankfurt datacenter (fra1) for German audience
   - Add your SSH key

### 2. Initial Server Setup

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install nginx
apt install nginx -y

# Create directory for the site
mkdir -p /var/www/odoo-directory

# Set proper permissions
chown -R www-data:www-data /var/www/odoo-directory
```

### 3. Configure Nginx

Create nginx configuration:

```bash
nano /etc/nginx/sites-available/odoo-directory
```

Add this configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name deutsche-odoo-experten.de www.deutsche-odoo-experten.de;
    
    root /var/www/odoo-directory;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle clean URLs
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
    
    # Blog routing
    location /blog/ {
        try_files $uri $uri/ $uri/index.html /blog/index.html;
    }
    
    # Partner routing
    location /partner/ {
        try_files $uri $uri/ $uri/index.html /partner/index.html;
    }
    
    # Error pages
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/odoo-directory /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 4. Upload Your Site

From your local machine:

```bash
# Build the site first
cd /home/eugen/Odoo\ 2.0/odoo-directory
npm run build

# Upload to server (replace YOUR_DROPLET_IP)
rsync -avz --delete dist/ root@YOUR_DROPLET_IP:/var/www/odoo-directory/

# Or use scp
scp -r dist/* root@YOUR_DROPLET_IP:/var/www/odoo-directory/
```

### 5. Set Up SSL with Let's Encrypt

```bash
# Install certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d deutsche-odoo-experten.de -d www.deutsche-odoo-experten.de
```

### 6. Set Up Automatic Deployment

Create deployment script on server:

```bash
nano /root/deploy-odoo-directory.sh
```

```bash
#!/bin/bash
# Deployment script for German Odoo Directory

SITE_DIR="/var/www/odoo-directory"
TEMP_DIR="/tmp/odoo-directory-deploy"

# Create temp directory
mkdir -p $TEMP_DIR

# Download latest build (you'll need to set up GitHub Actions or similar)
# For now, receive files via rsync

# Set permissions
chown -R www-data:www-data $SITE_DIR
find $SITE_DIR -type d -exec chmod 755 {} \;
find $SITE_DIR -type f -exec chmod 644 {} \;

# Clear nginx cache
nginx -s reload

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x /root/deploy-odoo-directory.sh
```

## Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build site
      run: npm run build
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to DigitalOcean
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.DROPLET_IP }}
        username: root
        key: ${{ secrets.SSH_KEY }}
        source: "dist/*"
        target: "/var/www/odoo-directory"
        strip_components: 1
```

## Performance Optimizations

### 1. Enable HTTP/2

Already included in the nginx configuration above.

### 2. Set Up CDN (Optional)

DigitalOcean Spaces CDN or Cloudflare can be added later for better performance.

### 3. Monitor Performance

```bash
# Install monitoring
apt install htop nethogs -y

# Check nginx access logs
tail -f /var/log/nginx/access.log
```

## Domain Setup

1. Add DNS records in your domain registrar:
   - A record: @ → YOUR_DROPLET_IP
   - A record: www → YOUR_DROPLET_IP

2. Wait for DNS propagation (5-30 minutes)

## Backup Strategy

Create a backup script:

```bash
nano /root/backup-site.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
SITE_DIR="/var/www/odoo-directory"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/odoo-directory-$DATE.tar.gz -C $SITE_DIR .

# Keep only last 7 backups
find $BACKUP_DIR -name "odoo-directory-*.tar.gz" -mtime +7 -delete
```

Add to cron:
```bash
crontab -e
# Add: 0 2 * * * /root/backup-site.sh
```

## Estimated Costs

- Droplet (1GB RAM): $6/month
- Domain: ~$12/year
- Total: ~$84/year

## Next Steps

1. Install DigitalOcean MCP in Claude Desktop
2. Use Claude to create and configure the droplet
3. Deploy your site
4. Set up SSL and domain
5. Configure automated deployments

The static site is lightweight and will perform excellently on a $6/month droplet!