#!/bin/bash
# Simple script to create placeholder assets
# Note: This requires ImageMagick or similar tools
# For manual creation, see assets/README.md

echo "Creating placeholder assets..."

# Create a simple green square as icon (if ImageMagick is available)
if command -v convert &> /dev/null; then
    # Icon
    convert -size 1024x1024 xc:#2d6a4f -pointsize 200 -fill white -gravity center -annotate +0+0 "RF" assets/icon.png
    
    # Splash
    convert -size 1242x2436 xc:#1a4d2e -pointsize 150 -fill white -gravity center -annotate +0+0 "Roll Football" assets/splash.png
    
    # Adaptive icon
    convert -size 1024x1024 xc:#2d6a4f -pointsize 200 -fill white -gravity center -annotate +0+0 "RF" assets/adaptive-icon.png
    
    # Favicon
    convert -size 48x48 xc:#2d6a4f assets/favicon.png
    
    echo "Placeholder images created!"
else
    echo "ImageMagick not found. Please create placeholder images manually:"
    echo "- assets/icon.png (1024x1024)"
    echo "- assets/splash.png (1242x2436)"
    echo "- assets/adaptive-icon.png (1024x1024)"
    echo "- assets/favicon.png (48x48)"
    echo ""
    echo "Or use any image editor to create simple colored squares."
fi
