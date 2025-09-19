#!/bin/bash

# Vercel Deployment Script for Compare Bot
# Run this to deploy to Vercel

echo "🚀 Deploying Compare Bot to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel first..."
    vercel login
fi

# Set up environment variables
echo "📝 Setting up environment variables..."
echo "Please make sure you have set these in your Vercel dashboard:"
echo "- DATABASE_URL"
echo "- NEON_DATABASE_URL"
echo "- OPENAI_API_KEY"
echo "- JWT_SECRET"
echo "- NEXT_PUBLIC_API_URL (for production)"

# Deploy
echo "🚀 Deploying..."
vercel --prod

echo "✅ Deployment complete!"
echo "Your app should be available at the URL shown above."
