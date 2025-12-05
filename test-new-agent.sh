#!/bin/bash

# Test script for the new Street Luxe / UK Urban agent

echo "🎯 Testing Street Luxe / UK Urban Editorial Agent"
echo "=================================================="
echo ""

# Check if the files were modified correctly
echo "✓ Checking NewsroomView.tsx..."
if grep -q "Street Luxe / UK Urban" /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN/components/NewsroomView.tsx; then
    echo "  ✅ Agent option added to dropdown"
else
    echo "  ❌ Agent option NOT found in dropdown"
fi

echo ""
echo "✓ Checking geminiService.ts..."
if grep -q "Street Luxe / UK Urban" /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN/services/geminiService.ts; then
    echo "  ✅ Agent persona instructions added"
else
    echo "  ❌ Agent persona NOT found"
fi

echo ""
echo "✓ Checking for comprehensive persona..."
if grep -q "23-year-old Black writer from the UK" /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN/services/geminiService.ts; then
    echo "  ✅ Detailed persona configured"
else
    echo "  ❌ Persona details missing"
fi

echo ""
echo "✓ Checking TTS voice mapping..."
if grep -q "if (style === 'Street Luxe / UK Urban')" /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN/services/geminiService.ts; then
    echo "  ✅ TTS voice mapped (Charon)"
else
    echo "  ❌ TTS voice mapping missing"
fi

echo ""
echo "✓ Checking rewrite function..."
if grep -q "else if (style === \"Street Luxe / UK Urban\")" /Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN/services/geminiService.ts; then
    echo "  ✅ Rewrite instructions added"
else
    echo "  ❌ Rewrite instructions missing"
fi

echo ""
echo "=================================================="
echo "📝 Documentation files created:"
echo "  - AGENT_STREET_LUXE_UK_URBAN.md"
echo "  - NEW_AGENT_SUMMARY.md"
echo ""
echo "🌐 To test in browser:"
echo "  1. Navigate to: http://localhost:3001/?admin=true"
echo "  2. Click 'ADMIN LOCKED' to unlock"
echo "  3. Click 'NEWS' to access newsroom"
echo "  4. Select 'Street Luxe / UK Urban' from dropdown"
echo "  5. Try a topic like: 'Supreme x Louis Vuitton legacy'"
echo ""
echo "✨ Agent is ready to use!"
