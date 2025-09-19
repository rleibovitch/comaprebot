#!/bin/bash

# Compare Bot Setup Script
# Run this to set up the development environment

echo "🚀 Setting up Compare Bot by Horseradish AI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update .env with your actual API keys and database credentials"
fi

# Initialize database
echo "🗄️  Initializing database..."
cd database
python3 init.py
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys and database credentials"
echo "2. Run 'npm run dev' to start the development servers"
echo "3. Visit http://localhost:3000 to see the application"
echo ""
echo "Demo credentials: client_001 / demo123"
