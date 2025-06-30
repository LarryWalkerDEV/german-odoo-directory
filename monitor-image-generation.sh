#!/bin/bash

echo "🖼️  Image Generation Monitor"
echo "=========================="

while true; do
    if [ -f .image-generation-progress.json ]; then
        PROCESSED=$(cat .image-generation-progress.json | python3 -c "import json, sys; data = json.load(sys.stdin); print(len(data['processed']))")
        FAILED=$(cat .image-generation-progress.json | python3 -c "import json, sys; data = json.load(sys.stdin); print(len(data['failed']))")
        TOTAL=129
        REMAINING=$((TOTAL - PROCESSED))
        PERCENTAGE=$(python3 -c "print(f'{$PROCESSED/$TOTAL*100:.1f}')")
        
        clear
        echo "🖼️  Image Generation Progress"
        echo "============================="
        echo "✅ Generated: $PROCESSED / $TOTAL ($PERCENTAGE%)"
        echo "🎨 Remaining: $REMAINING"
        echo "❌ Failed: $FAILED"
        echo ""
        echo "Progress Bar:"
        python3 -c "
import sys
p = $PROCESSED
t = $TOTAL
bar_len = 50
filled = int(bar_len * p / t)
bar = '█' * filled + '░' * (bar_len - filled)
print(f'[{bar}]')
"
        echo ""
        echo "Estimated time remaining: $(($REMAINING * 18 / 60)) minutes"
        echo ""
        echo "Press Ctrl+C to stop monitoring"
    else
        echo "Progress file not found. Waiting..."
    fi
    
    sleep 10
done