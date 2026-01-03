#!/bin/bash

# Build script for Go Lambda functions without Docker

set -e

echo "🔨 Building Go Lambda functions..."

cd "$(dirname "$0")/../backend"

# Download dependencies
echo "Downloading Go dependencies..."
go mod tidy
go mod download

# Create build directory
mkdir -p ../infrastructure/dist/lambda

# Build each Lambda function
echo "Building signup function..."
cd auth
mkdir -p ../../infrastructure/dist/lambda/signup
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o ../../infrastructure/dist/lambda/signup/bootstrap signup.go

echo "Building signin function..."
mkdir -p ../../infrastructure/dist/lambda/signin
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o ../../infrastructure/dist/lambda/signin/bootstrap signin.go

echo "Building signout function..."
mkdir -p ../../infrastructure/dist/lambda/signout
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o ../../infrastructure/dist/lambda/signout/bootstrap signout.go

echo "Building me function..."
mkdir -p ../../infrastructure/dist/lambda/me
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o ../../infrastructure/dist/lambda/me/bootstrap me.go

echo "✅ All Lambda functions built successfully!"
echo "📁 Binaries located in: infrastructure/dist/lambda/"