#!/bin/bash

echo "🚀 Preparing German Odoo Directory for Deployment"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build the site
echo -e "${BLUE}📦 Building the site...${NC}"
npm run build

# Check build success
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_DIR="deploy_${TIMESTAMP}"

mkdir -p $DEPLOY_DIR

# Copy dist folder
cp -r dist/* $DEPLOY_DIR/

# Create deployment info
cat > $DEPLOY_DIR/deployment-info.txt << EOF
German Odoo Directory - Deployment Package
Generated: $(date)
Build Version: $TIMESTAMP

Contents:
- Static HTML/CSS/JS files
- Blog articles: $(ls -1 dist/blog | wc -l) articles
- Generated images from Supabase storage

Deployment Instructions:
1. Upload contents to /var/www/odoo-directory/ on your server
2. Ensure nginx is configured (see nginx.conf)
3. Set proper permissions: chown -R www-data:www-data /var/www/odoo-directory

EOF

# Create nginx configuration
cat > $DEPLOY_DIR/nginx.conf << 'EOF'
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
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https://coaqbzaadmujuewxfhel.supabase.co; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://coaqbzaadmujuewxfhel.supabase.co data:; font-src 'self';" always;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Cache HTML for 1 hour
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
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
    
    # Sitemap
    location = /sitemap.xml {
        try_files $uri =404;
    }
    
    # RSS feed
    location = /blog/feed.xml {
        try_files $uri =404;
        add_header Content-Type "application/rss+xml";
    }
    
    # Error pages
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
EOF

# Create deployment script
cat > $DEPLOY_DIR/deploy-to-server.sh << 'EOF'
#!/bin/bash

# Deployment script - run from local machine
# Usage: ./deploy-to-server.sh YOUR_SERVER_IP

if [ -z "$1" ]; then
    echo "Usage: $0 YOUR_SERVER_IP"
    exit 1
fi

SERVER_IP=$1
SERVER_USER="root"
REMOTE_PATH="/var/www/odoo-directory"

echo "🚀 Deploying to $SERVER_IP..."

# Upload files
echo "📤 Uploading files..."
rsync -avz --delete \
    --exclude 'deployment-info.txt' \
    --exclude 'nginx.conf' \
    --exclude 'deploy-to-server.sh' \
    ./* $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

# Set permissions on server
echo "🔒 Setting permissions..."
ssh $SERVER_USER@$SERVER_IP "chown -R www-data:www-data $REMOTE_PATH && find $REMOTE_PATH -type d -exec chmod 755 {} \; && find $REMOTE_PATH -type f -exec chmod 644 {} \;"

# Reload nginx
echo "🔄 Reloading nginx..."
ssh $SERVER_USER@$SERVER_IP "nginx -t && systemctl reload nginx"

echo "✅ Deployment complete!"
echo "🌐 Visit your site at http://$SERVER_IP"
EOF

chmod +x $DEPLOY_DIR/deploy-to-server.sh

# Create tarball
echo -e "${BLUE}📦 Creating deployment archive...${NC}"
tar -czf ${DEPLOY_DIR}.tar.gz $DEPLOY_DIR/

# Summary
echo -e "${GREEN}✅ Deployment package ready!${NC}"
echo ""
echo "📁 Package created: ${DEPLOY_DIR}.tar.gz"
echo "📊 Package size: $(du -h ${DEPLOY_DIR}.tar.gz | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Install DigitalOcean MCP in Claude Desktop"
echo "2. Create a droplet using the MCP"
echo "3. Extract and deploy: tar -xzf ${DEPLOY_DIR}.tar.gz"
echo "4. Run: cd $DEPLOY_DIR && ./deploy-to-server.sh YOUR_SERVER_IP"
echo ""
echo "Or deploy manually by copying $DEPLOY_DIR/* to your server"