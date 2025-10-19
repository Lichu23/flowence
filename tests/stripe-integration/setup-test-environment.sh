#!/bin/bash

# 🧪 Stripe Integration Test Setup Script
# Sprint 3.3 - Sales Processing Part 2

echo "🚀 Setting up Stripe Integration Test Environment..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the flowence-client directory"
    exit 1
fi

echo "📋 Pre-flight checks..."

# Check if backend is running
echo "🔍 Checking backend server..."
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:3002"
else
    echo "❌ Backend server is not running. Please start it with: cd ../server && npm run dev"
    exit 1
fi

# Check environment variables
echo "🔍 Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local; then
        echo "✅ Stripe publishable key is configured"
    else
        echo "⚠️  Warning: Stripe publishable key not found in .env.local"
        echo "   Please add: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here"
    fi
else
    echo "❌ .env.local file not found. Creating template..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
EOF
    echo "📝 Created .env.local template. Please update with your actual Stripe key."
fi

# Check if frontend is running
echo "🔍 Checking frontend server..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend server is running on http://localhost:3001"
else
    echo "❌ Frontend server is not running. Starting it now..."
    npm run dev &
    echo "⏳ Waiting for frontend to start..."
    sleep 10
fi

echo ""
echo "🎯 Test Environment Ready!"
echo "========================="
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend:  http://localhost:3002"
echo "🧪 Test Plan: tests/stripe-integration/STRIPE_INTEGRATION_TEST.md"
echo ""
echo "🚀 Next Steps:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Login to the application"
echo "3. Navigate to /pos"
echo "4. Follow the test cases in STRIPE_INTEGRATION_TEST.md"
echo ""
echo "💡 Test Cards (Stripe Test Mode):"
echo "   ✅ Success: 4242 4242 4242 4242"
echo "   ❌ Declined: 4000 0000 0000 0002"
echo "   🔐 Auth Required: 4000 0025 0000 3155"
echo ""
echo "🎉 Happy Testing!"