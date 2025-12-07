#!/bin/bash

# Auto-deploy script for RFLCTN
# Generates a new article and deploys to production

echo "🎨 RFLCTN Auto-Deploy"
echo "===================="
echo ""

# Step 1: Generate new article
echo "📝 Generating new article..."
cd ../../nodal-curie
python main.py --mode once --auto

if [ $? -ne 0 ]; then
    echo "❌ Article generation failed"
    exit 1
fi

echo "✅ Article generated"
echo ""

# Step 2: Copy articles to website
echo "📋 Copying articles to website..."
cd ../ionic-rocket/RFLCTN

# Create articles directory in website if it doesn't exist
mkdir -p public/articles

# Copy all markdown files
cp ../../nodal-curie/articles/*.md public/articles/

echo "✅ Articles copied"
echo ""

# Generate JSON Manifest
echo "📊 Generating JSON manifest..."
python3 scripts/generate_manifest.py

if [ $? -ne 0 ]; then
    echo "❌ Manifest generation failed"
    exit 1
fi

echo "✅ Manifest generated"
echo ""

# Step 3: Commit and push to GitHub
echo "🔄 Committing changes..."
git add .
git commit -m "Auto-deploy: New article generated $(date '+%Y-%m-%d %H:%M')"

if [ $? -eq 0 ]; then
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Pushed to GitHub - Vercel will auto-deploy!"
        echo ""
        echo "🌐 Your site will update in ~1 minute"
        echo "Visit: https://rflctn.vercel.app"
    else
        echo "❌ Push failed - check your git configuration"
    fi
else
    echo "ℹ️  No changes to commit"
fi

echo ""
echo "✨ Done!"
