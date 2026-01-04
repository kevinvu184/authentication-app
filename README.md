# Authentication App

A complete authentication application with a serverless backend and a React frontend.

## Architecture

- **Frontend**: React + TypeScript single-page application (SPA) deployed to S3 and served via CloudFront
- **Backend**: Go-based Lambda functions exposed through API Gateway
- **Infrastructure**: AWS CDK (TypeScript) used for infrastructure as code
- **Database**: DynamoDB used for user data storage
- **Authentication**: JWT-based authentication with secure password hashing

## Deployment

1. Change directory to `./infrastructure`
2. Run `./build-lambdas.sh`
3. Deploy with CDK:
   `AWS_PROFILE=<your-aws-profile> JWT_SECRET=<your-secret> npx cdk deploy --context environment=<env>`

## Report

### Setup and Architectural Choices

- **Serverless Architecture**: Chose a serverless approach to minimize operational overhead, with scaling handled automatically. Each authentication operation (signup, signin, signout, me) is implemented as a separate Lambda function to improve separation of concerns and enable independent scaling.
- **JWT Authentication**: Implemented stateless authentication using JWTs for scalability. Tokens include user ID and email claims with a 24-hour expiration.
- **CDK Infrastructure as Code**: Used AWS CDK with TypeScript for type-safe infrastructure definitions, enabling version control and reproducible deployments.
- **React Frontend**: Built a single-page application using React Router for client-side routing and TypeScript for improved type safety.

### Potential Weaknesses and Production Improvements

- JWT secrets are stored in environment variables and should be moved to AWS Secrets Manager or Parameter Store
- CORS allows all origins and should be restricted to specific domains based on the environment
- No rate limiting is implemented, leaving the system vulnerable to brute-force attacks
- Missing input sanitization and comprehensive validation
- DynamoDB modelling is naive for the use case and could be improved using a single-table design approach

### Frontend State and Data Flow

**State Management Choice**:
Used the React Context API for authentication state management instead of external libraries, based on the following considerations:

- **Simplicity**: Authentication state is relatively simple (user, token, loading states)
- **Built-in Solution**: No additional dependencies are required
- **Performance**: Authentication state does not change frequently, minimizing re-renders
- **Scope**: Authentication is a cross-cutting concern that benefits from global state

**Data Persistence**:
Used `localStorage` for token persistence to maintain sessions across browser refreshes, keeping the implementation simple and avoiding complex state rehydration logic.

**Validation Strategy**:
Implemented basic HTML5 validation and manual validation in API calls rather than using a dedicated validation library. For larger applications, libraries such as Formik + Yup or React Hook Form + Zod would provide more robust form handling.

**Data Flow**:
Followed a unidirectional data flow pattern where user actions trigger API calls through the authentication context, which updates global state and propagates changes to consuming components.

### Types and Contracts

**Manual Type Synchronization**:
Currently using manual type definitions in both the frontend (`src/types.ts`) and backend (`common/utils.go`). Types are kept in sync through:

- Consistent naming of fields and structures
- JSON tags on Go structs that match TypeScript interfaces
- Manual code reviews to ensure consistency

**Limitations of the Current Approach**:

- No compile-time guarantees for API contract compatibility
- Risk of type drift between frontend and backend
- Ongoing manual maintenance overhead

**Better Approaches for Production**:

- Use GraphQL as the API layer between the frontend and backend
- Use OpenAPI/Swagger to generate TypeScript types from API specifications
- Consider migrating the backend from Go to TypeScript to maintain a monolingual codebase
