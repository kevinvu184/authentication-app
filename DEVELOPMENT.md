# Authentication App - Development Guide

## Quick Start

1. **Setup the project:**
   ```bash
   ./setup.sh
   ```

2. **Deploy the backend:**
   ```bash
   cd infrastructure
   ./deploy.sh dev
   ```

3. **Update frontend configuration:**
   - Copy the API endpoint URL from the deployment output
   - Update `frontend/.env.local` with your API endpoint

4. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

## Manual Setup

### Prerequisites

- Go 1.21+
- Node.js 18+
- AWS CLI configured with appropriate permissions
- AWS SAM CLI

### Backend Development

```bash
cd backend

# Install dependencies
go mod tidy

# Run locally (requires AWS credentials)
sam local start-api --template ../infrastructure/template.yaml
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Environment Variables

#### Backend (.env)
```bash
USERS_TABLE=auth-app-users-dev
JWT_SECRET=your-jwt-secret-here
AWS_REGION=us-east-1
```

#### Frontend (.env.local)
```bash
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev
```

## Testing

### Backend Testing

Test the API endpoints using curl:

```bash
# Sign up
curl -X POST $API_ENDPOINT/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Sign in
curl -X POST $API_ENDPOINT/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (replace TOKEN with actual JWT)
curl -X GET $API_ENDPOINT/user/profile \
  -H 'Authorization: Bearer TOKEN'

# Update profile
curl -X PUT $API_ENDPOINT/user/profile \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Frontend Testing

1. Open http://localhost:3000
2. Test user registration and login flows
3. Verify protected profile page access
4. Test profile editing functionality

## Deployment

### Development
```bash
cd infrastructure
./deploy.sh dev
```

### Production
```bash
cd infrastructure
./deploy.sh prod your-production-jwt-secret
```

## Troubleshooting

### Common Issues

1. **CORS Issues**: Ensure API Gateway CORS is properly configured
2. **JWT Errors**: Check JWT_SECRET environment variable
3. **DynamoDB Permissions**: Verify Lambda execution role has DynamoDB access
4. **Build Failures**: Ensure Go version is 1.21+ and proper module structure

### Logs

View Lambda function logs:
```bash
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/auth-app
aws logs tail /aws/lambda/auth-app-dev-SignUpFunction --follow
```

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **HTTPS**: Always use HTTPS in production
3. **Environment Variables**: Never commit sensitive data to version control
4. **Password Policy**: Implement appropriate password strength requirements
5. **Rate Limiting**: Consider adding rate limiting to API endpoints
6. **Input Validation**: Validate all user inputs server-side

## Architecture Decisions

### Why Serverless?
- **Cost Effective**: Pay only for what you use
- **Auto Scaling**: Handles traffic spikes automatically
- **Managed Infrastructure**: No server maintenance required

### Why DynamoDB?
- **Performance**: Single-digit millisecond latency
- **Serverless Native**: Integrates well with Lambda
- **Cost Effective**: On-demand billing

### Why JWT?
- **Stateless**: No server-side session storage required
- **Scalable**: Works across multiple Lambda instances
- **Standard**: Well-established authentication method

### Trade-offs Made

1. **Simplicity over Features**: Basic auth flow without advanced features like password reset
2. **Single Table Design**: One DynamoDB table with GSI for user lookup
3. **Client-side Token Storage**: Using localStorage for simplicity (consider secure httpOnly cookies for production)
4. **No Rate Limiting**: Keep it simple, but should be added for production
5. **Basic Validation**: Minimal input validation for demonstration purposes