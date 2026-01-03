# Authentication App

A complete authentication application with a serverless backend and React frontend.

## Architecture

- **Backend**: Go Lambda functions with API Gateway
- **Database**: DynamoDB for user storage
- **Authentication**: JWT-based authentication with secure password hashing
- **Frontend**: React TypeScript SPA

## Project Structure

```
├── backend/           # Go Lambda functions
│   ├── auth/         # Authentication handlers (signup, signin, signout, me)
│   ├── user/         # User profile handlers
│   ├── common/       # Shared utilities and models
│   ├── middleware/   # Authentication middleware
│   └── storage/      # Database access layer
├── frontend/         # React TypeScript app
├── infrastructure/   # AWS SAM/CloudFormation templates
└── docs/            # Documentation
```

## Features

- **User Authentication**
  - User registration with email and password
  - Secure login with JWT tokens
  - Password hashing with bcrypt
  - Token-based authentication
- **User Management**
  - Protected user profile access
  - User profile updates
  - Account session management
- **Security**
  - JWT token validation
  - Secure password storage
  - Protected API endpoints
- **Database**
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
- Go 1.21+
- Node.js 18+
- AWS SAM CLI

### Backend Deployment
```bash
cd infrastructure
sam build
sam deploy --guided
```

### Frontend Deployment
```bash
cd frontend
npm install
npm run build
# Deploy build output to S3 or CloudFront
```

## Local Development

### Backend
```bash
cd backend
go mod tidy
sam local start-api
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Security Features

- **Password Security**: Bcrypt hashing with salt
- **JWT Tokens**: Secure token generation with expiration
- **Input Validation**: Email format and password strength validation
- **CORS**: Configured for cross-origin requests
- **Authorization**: Bearer token authentication for protected endpoints