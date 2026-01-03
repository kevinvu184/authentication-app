#!/bin/bash

# Complete setup script for the authentication app
set -e

echo "🚀 Setting up Authentication App..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Go installation
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ first."
    exit 1
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check AWS CLI installation
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install and configure AWS CLI first."
    exit 1
fi

# Check AWS SAM installation
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI is not installed. Please install AWS SAM CLI first."
    echo "   Installation guide: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ All prerequisites met!"

# Get current directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Setup backend
echo "🔧 Setting up backend..."
cd "$PROJECT_ROOT/backend"

# Initialize Go modules and install dependencies
go mod tidy

# Setup frontend
echo "🔧 Setting up frontend..."
cd "$PROJECT_ROOT/frontend"

# Install Node.js dependencies
npm install

echo "✅ Dependencies installed!"

# Create environment files
echo "📝 Creating environment configuration..."

# Backend environment (for local development)
cat > "$PROJECT_ROOT/backend/.env" << EOF
# Local development environment variables
USERS_TABLE=auth-app-users-dev
JWT_SECRET=$(openssl rand -base64 32)
AWS_REGION=us-east-1
EOF

# Frontend environment
cp "$PROJECT_ROOT/frontend/.env.example" "$PROJECT_ROOT/frontend/.env.local"

echo "✅ Environment files created!"
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy the backend infrastructure:"
echo "   cd infrastructure && ./deploy.sh dev"
echo ""
echo "2. Update frontend/.env.local with your API endpoint"
echo ""
echo "3. Start the frontend development server:"
echo "   cd frontend && npm start"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see README.md"