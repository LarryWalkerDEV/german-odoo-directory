#!/bin/bash

echo "🚀 Starting German Odoo Directory Server"
echo "==========================================\n"

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is already in use!"
    echo "   Kill the existing process or use a different port.\n"
    exit 1
fi

echo "📁 Serving from: $(pwd)/dist"
echo "🌐 Server URL: http://localhost:8080"
echo "\n✨ The site should now be accessible at http://localhost:8080"
echo "   Press Ctrl+C to stop the server\n"

# Start the server
cd dist && python3 -m http.server 8080