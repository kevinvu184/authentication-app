# Authentication App

A simple authentication application with a serverless backend and a React frontend.

✅ ✅ ✅ Demo: https://d216pkagaamp8.cloudfront.net/ ✅ ✅ ✅ 
⚠️ ⚠️ ⚠️ DO NOT USE YOUR REAL PASSWORD ⚠️ ⚠️ ⚠️

https://github.com/user-attachments/assets/deaf5632-a8fc-478d-9845-d6b8f89afad0

## Architecture

- **Frontend**: React + TypeScript single-page application (SPA) deployed to Amazon S3 and served via CloudFront
- **Backend**: Go-based AWS Lambda functions exposed through API Gateway
- **Infrastructure**: AWS CDK (TypeScript) used for infrastructure as code
- **Database**: DynamoDB used for user data storage
- **Authentication**: JWT-based authentication with secure password hashing

## Deployment

1. Change the directory to `./infrastructure`
2. Run `./build-lambdas.sh`
3. Deploy using CDK:

   ```bash
   AWS_PROFILE=<your-aws-profile> \
   JWT_SECRET=<your-secret> \
   npx cdk deploy --context environment=<env>
   ```

## Report

### Setup and Architectural Choices

- **Serverless Architecture**: A serverless approach was chosen to minimise overhead, with scaling handled automatically. Each authentication operation (signup, signin, signout, me) is implemented as a separate Lambda function to improve separation of concerns and enable independent scaling.
- **JWT Authentication**: Stateless authentication is implemented using JWTs for scalability. Tokens include user ID and email claims with a 24-hour expiration.
- **Infrastructure as Code (CDK)**: AWS CDK with TypeScript is used to provide type-safe infrastructure definitions, enabling version control and reproducible deployments.
- **React Frontend**: A single-page application is built using React Router for client-side routing and TypeScript for improved type safety.

### Potential Weaknesses and Production Improvements

- JWT secrets are stored in environment variables and should be migrated to AWS Secrets Manager or AWS Systems Manager Parameter Store.
- CORS currently allows all origins and should be restricted to environment-specific domains.
- No rate limiting is implemented, leaving the system vulnerable to brute-force attacks.
- Input sanitisation and comprehensive validation are missing.
- The DynamoDB data model is simplistic and could be improved using a single-table design approach.

### Frontend State and Data Flow

**State Management**

The React Context API is used for authentication state management instead of external libraries, based on the following considerations:

- **Simplicity**: Authentication state is limited to user data, tokens, and loading states.
- **Built-in Solution**: No additional dependencies are required.
- **Performance**: Authentication state changes infrequently, reducing unnecessary re-renders.
- **Scope**: Authentication is a cross-cutting concern that benefits from global state.

**Data Persistence**

`localStorage` is used to persist authentication tokens, allowing sessions to survive browser refreshes while keeping the implementation simple and avoiding complex state rehydration logic.

**Validation Strategy**

Basic HTML5 validation and manual validation in API calls are implemented instead of using a dedicated validation library. For larger applications, libraries such as Formik + Yup or React Hook Form + Zod would provide more robust validation and form handling.

**Data Flow**

A unidirectional data flow is followed, where user actions trigger API calls through the authentication context. The context updates global state, which then propagates changes to consuming components.

### Types and Contracts

**Manual Type Synchronisation**

Manual type definitions are currently maintained in both the frontend (`src/types.ts`) and backend (`common/utils.go`). Consistency is ensured through:

- Consistent field and structure naming
- JSON tags on Go structs matching TypeScript interfaces
- Manual code reviews

**Limitations of the Current Approach**

- No compile-time guarantees for API contract compatibility
- Risk of type drift between frontend and backend
- Ongoing manual maintenance overhead

**Production-Grade Alternatives**

- Use GraphQL as the API layer between the frontend and backend
- Use OpenAPI/Swagger to generate TypeScript types from API specifications
- Consider migrating the backend from Go to TypeScript to maintain a monolingual codebase

### Scenario 1: Brute-Force Attacks on Login Endpoints

**Infrastructure Layer**

- **API Gateway Rate Limiting**: Implement usage plans with throttling (e.g. 10 requests per second per API key).
- **Monitoring and Alerts**: Configure CloudWatch alarms for abnormal authentication patterns and spikes in failed login attempts.

**Backend Layer**

- **Progressive Response Delays**: Apply exponential backoff delays for repeated failed attempts without permanently blocking users.
- **IP-Based Rate Limiting**: Track and slow requests from IP addresses with high failure rates using DynamoDB.
- **CAPTCHA Enforcement**: Require CAPTCHA verification after 3–5 failed attempts from the same IP or session.

**Frontend Layer**

- **Client-Side Delays**: Apply progressive delays after repeated failed login attempts within a session.
- **CAPTCHA Integration**: Dynamically display CAPTCHA challenges when triggered by backend signals.
- **Rate-Limit Feedback**: Provide clear user feedback when rate limits are reached, including retry timing.

### Scenario 2: Handling Millions of Requests per Second with Fault Tolerance

**Infrastructure Layer**

- **Lambda Optimisation**: Configure reserved concurrency and provisioned concurrency to eliminate cold starts.
- **Global Distribution**: Use CloudFront with aggressive edge caching, custom cache keys, and clearly defined cache invalidation strategies.

**Backend Layer**

- **Caching Strategy**

  - Application-level caching within Lambda functions using in-memory storage.
  - CDN caching for authentication responses with short TTLs.

- **Event-Driven Processing**

  - Use SQS/SNS for asynchronous handling of non-critical operations.
  - Use EventBridge to decouple authentication events from core business logic.

- **Resilience Patterns**: Implement circuit breakers, retries with exponential backoff, and graceful degradation.

**Frontend Layer**

- **Static Page Generation**: Continue using static page generation for maximum performance and resilience.
