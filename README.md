# Authentication App

A minimal authentication application with a serverless backend and React frontend.

## Architecture

- **Backend**: Go Lambda functions with API Gateway
- **Database**: DynamoDB for user profiles
- **Authentication**: AWS Cognito User Pools
- **Frontend**: React TypeScript SPA

## Project Structure

```
├── backend/           # Go Lambda functions
│   ├── auth/         # Authentication handlers
│   ├── user/         # User profile handlers
│   └── common/       # Shared utilities
├── frontend/         # React TypeScript app
├── infrastructure/   # AWS CloudFormation/CDK
└── docs/            # Documentation
```

## Features

- User sign-up and sign-in
- Protected profile page
- JWT-based authentication
- Secure password handling
- Token refresh mechanism

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

- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/refresh` - Refresh JWT token
- `GET /user/profile` - Get user profile (protected)
- `PUT /user/profile` - Update user profile (protected)

## Environment Variables

See `.env.example` files in each directory for required configuration.