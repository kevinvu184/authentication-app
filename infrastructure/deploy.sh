#!/bin/bash

# AWS SAM deployment script for authentication app

set -e

echo "🚀 Deploying Authentication App Infrastructure..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Set variables
ENVIRONMENT=${1:-dev}
JWT_SECRET=${2:-$(openssl rand -base64 32)}

echo "📝 Environment: $ENVIRONMENT"
echo "🔐 JWT Secret: [HIDDEN]"

# Navigate to infrastructure directory
cd "$(dirname "$0")"

# Copy template to backend directory for SAM
cp template.yaml ../backend/

# Navigate to backend directory
cd ../backend

# Build the application
echo "🔨 Building Lambda functions..."
sam build --template template.yaml

# Deploy the stack
echo "🚀 Deploying to AWS..."
sam deploy \
    --template template.yaml \
    --stack-name "auth-app-$ENVIRONMENT" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        Environment="$ENVIRONMENT" \
        JWTSecret="$JWT_SECRET" \
    --confirm-changeset

# Get the API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "auth-app-$ENVIRONMENT" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayEndpoint`].OutputValue' \
    --output text)

echo "✅ Deployment completed successfully!"
echo "🌐 API Endpoint: $API_ENDPOINT"
echo "📋 Test your API:"
echo "   curl -X POST $API_ENDPOINT/auth/signup -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"John\",\"lastName\":\"Doe\"}'"

# Clean up
rm -f template.yaml