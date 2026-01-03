# Authentication App

A complete authentication application with a serverless backend and React frontend.

## Architecture

- **Backend**: Go Lambda functions with API Gateway
- **Database**: DynamoDB for user storage
- **Authentication**: JWT-based authentication with secure password hashing
- **Infrastructure**: AWS CDK (TypeScript) for Infrastructure as Code
- **Frontend**: React TypeScript SPA

## Project Structure

```
├── backend/           # Go Lambda functions
│   ├── auth/         # Authentication handlers (signup, signin, signout, me)
│   └── common/       # Shared utilities and models
├── frontend/         # React TypeScript app
├── infrastructure/   # AWS CDK TypeScript templates
│   ├── bin/         # CDK app entry point
│   ├── lib/         # CDK stack definitions
│   ├── deploy.sh    # Deployment script
│   └── cdk-utils.sh # CDK utility commands
└── docs/            # Documentation
```

## Features

- **User Authentication**
  - User registration with email and password
  - Secure login with JWT tokens
  - Password hashing with bcrypt
  - Token-based authentication
- **Protected Access**
  - View protected user profile page
  - JWT token validation for protected routes
  - Secure logout functionality
- **Database Storage**
  - DynamoDB for scalable user storage
  - Email-based user identification
  - Efficient user lookup by ID or email

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- AWS CLI configured
- AWS CDK (optional)

### Backend Setup

```bash
cd backend
go mod tidy
sam build
sam deploy --guided
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## API Endpoints

This minimal authentication API provides exactly what's needed for the frontend requirements:

### Authentication Endpoints

#### POST /api/auth/signup
Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "user": {
    "id": "abc123...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-01-03T10:00:00Z",
    "updatedAt": "2026-01-03T10:00:00Z"
  }
}
```

#### POST /api/auth/signin
Authenticates an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "user": {
    "id": "abc123...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-01-03T10:00:00Z",
    "updatedAt": "2026-01-03T10:00:00Z"
  }
}
```

#### POST /api/auth/signout
Signs out the current user (client-side token removal).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "message": "Successfully signed out"
}
```

#### GET /api/me
Gets the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "id": "abc123...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2026-01-03T10:00:00Z",
  "updatedAt": "2026-01-03T10:00:00Z"
}
```

### User Profile Endpoints (Legacy - for backward compatibility)

- `GET /user/profile` - Get user profile (protected)
- `PUT /user/profile` - Update user profile (protected)

### User Profile Endpoints (Legacy - for backward compatibility)

- `GET /user/profile` - Get user profile (protected)
- `PUT /user/profile` - Update user profile (protected)

### Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (user not found)
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

## Database Schema

### Users Table (DynamoDB)

**Primary Key:** `email` (String)
**Global Secondary Index:** `UserIdIndex` on `id` field

**Attributes:**
- `email` (String) - User's email address (primary key)
- `id` (String) - Unique user identifier
- `password` (String) - Bcrypt hashed password
- `firstName` (String) - User's first name
- `lastName` (String) - User's last name
- `createdAt` (String) - ISO 8601 timestamp
- `updatedAt` (String) - ISO 8601 timestamp

## Environment Variables

### Backend (Lambda Functions)
- `USERS_TABLE` - DynamoDB table name for users
- `JWT_SECRET` - Secret key for JWT token signing/validation
- `AWS_REGION` - AWS region for DynamoDB access

### Frontend
See `.env.example` files in each directory for required configuration.

## Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js 20+ and npm (CDK requires Node 20)
- Go 1.21+
- Docker (for Lambda function bundling)
- AWS CDK CLI (`npm install -g aws-cdk`)

### Backend Deployment with CDK
```bash
cd infrastructure
npm install              # Install CDK dependencies
npm run build            # Compile TypeScript
npm run synth            # Generate CloudFormation (optional)
./deploy.sh dev         # Deploy to dev environment
# or
./deploy.sh prod your-jwt-secret-here  # Deploy to prod with custom JWT secret
```

### CDK Management Commands
```bash
cd infrastructure
npm run clean                # Clean build artifacts
./cdk-utils.sh dev diff     # Preview changes
./cdk-utils.sh dev synth    # Generate CloudFormation
./cdk-utils.sh dev destroy  # Delete stack
./cdk-utils.sh dev logs     # View log groups
```

### Frontend Deployment
```bash
cd frontend
npm install
npm run build
# Deploy build output to S3 or CloudFront
```

## Local Development

### Backend Development
```bash
# Local development with CDK
cd infrastructure
npm install
npm run build
npx cdk synth          # Generate CloudFormation

# Test individual functions locally (requires SAM)
cd backend
go run auth/signup.go  # Test signup function
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Security Features

- **Security Features**: Bcrypt hashing with salt
- **JWT Tokens**: Secure token generation with expiration
- **Input Validation**: Email format and password strength validation
- **CORS**: Configured for cross-origin requests
- **Authorization**: Bearer token authentication for protected endpoints

## Infrastructure as Code (CDK)

This project uses AWS CDK with TypeScript for infrastructure management, providing:

- **Type Safety**: TypeScript ensures compile-time checking of AWS resources
- **Reusable Constructs**: Modular and reusable infrastructure components  
- **Version Control**: Infrastructure changes tracked alongside application code
- **Multi-Environment**: Easy deployment to different environments (dev, staging, prod)
- **Programmatic Control**: Advanced logic and conditionals in infrastructure definitions

### CDK Stack Overview

The [AuthAppStack](infrastructure/lib/auth-app-stack.ts) defines:
- **DynamoDB Table**: Users table with email primary key and ID index
- **Lambda Functions**: Go-based handlers for authentication endpoints
- **API Gateway**: RESTful API with CORS support
- **IAM Permissions**: Least-privilege access for Lambda functions
- **Environment Variables**: Configuration injection for runtime

### Migration from SAM

The project was migrated from AWS SAM to CDK for better:
- **Developer Experience**: Full IDE support with IntelliSense
- **Flexibility**: Programmatic resource creation and configuration
- **Maintainability**: Strongly-typed infrastructure definitions
- **Testing**: Unit testing capabilities for infrastructure code