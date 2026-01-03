#!/bin/bash

# CDK setup validation script

set -e

echo "🔍 Validating CDK Infrastructure Setup..."

cd "$(dirname "$0")"

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI"
    exit 1
else
    AWS_VERSION=$(aws --version)
    echo "✅ AWS CLI: $AWS_VERSION"
fi

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Run 'aws configure'"
    exit 1
else
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=${AWS_DEFAULT_REGION:-us-east-1}
    echo "✅ AWS Account: $AWS_ACCOUNT"
    echo "✅ AWS Region: $AWS_REGION"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Validate TypeScript compilation
echo "🔨 Validating TypeScript compilation..."
npm run build

# Validate CDK synthesis
echo "📝 Testing CDK synthesis..."
export JWT_SECRET="test-secret-for-validation"
npx cdk synth --context environment=dev --context jwtSecret="$JWT_SECRET" > /dev/null

echo ""
echo "✅ CDK Infrastructure setup is valid!"
echo "🚀 Ready to deploy with: ./deploy.sh dev"
echo "🔧 Manage with: ./cdk-utils.sh dev [command]"