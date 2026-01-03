#!/bin/bash

# AWS CDK deployment script for authentication app

set -e

echo "🚀 Deploying Authentication App Infrastructure with CDK..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if Node.js and npm are available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Set variables
ENVIRONMENT=${1:-dev}
JWT_SECRET=${2:-$(openssl rand -base64 32)}

echo "📝 Environment: $ENVIRONMENT"
echo "🔐 JWT Secret: [HIDDEN]"

# Navigate to infrastructure directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing CDK dependencies..."
    npm install
fi
# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Bootstrap CDK if needed (only run once per account/region)
echo "🏗️  Checking CDK bootstrap..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region ${AWS_DEFAULT_REGION:-us-east-1} >/dev/null 2>&1; then
    echo "🏗️  Bootstrapping CDK..."
    npx cdk bootstrap
fi

# Deploy the stack
echo "🚀 Deploying CDK stack..."
npx cdk deploy \
    --require-approval never \
    --context environment="$ENVIRONMENT" \
    --context jwtSecret="$JWT_SECRET" \
    --outputs-file outputs.json

# Get the API endpoint from outputs
if [ -f "outputs.json" ]; then
    API_ENDPOINT=$(cat outputs.json | grep -o '"ApiGatewayEndpoint":"[^"]*"' | cut -d'"' -f4)
    
    echo "✅ Deployment completed successfully!"
    echo "🌐 API Endpoint: $API_ENDPOINT"
    echo "📋 Test your API:"
    echo "   curl -X POST $API_ENDPOINT/api/auth/signup -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"John\",\"lastName\":\"Doe\"}'"
    
    # Clean up outputs file
    rm -f outputs.json
else
    echo "⚠️  Could not retrieve API endpoint. Check CDK outputs manually."
fi