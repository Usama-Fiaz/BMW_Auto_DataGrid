#!/bin/bash

# BMW IT Internship Aptitude Test - Setup Script
# This script automates the setup process for the Universal DataGrid solution

set -e  # Exit on any error

echo "📊 BMW IT Internship Aptitude Test - Setup Script"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd autogrid
npm install
cd ..

# Setup database
echo "🗄️  Setting up database..."
cd server
node database/setup.js
cd ..

# Import data
echo "📊 Importing sample data..."
cd server
node database/import_to_universal.js
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   cd server && npm start"
echo ""
echo "2. Start the frontend application:"
echo "   cd autogrid && npm start"
echo ""
echo "3. Or use the convenience script to start both:"
echo "   npm run dev"
echo ""
echo "4. Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "Happy coding! 🚀" 