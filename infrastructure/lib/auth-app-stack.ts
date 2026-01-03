import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "path";

export interface AuthAppStackProps extends cdk.StackProps {
  environment: string;
  jwtSecret: string;
}

export class AuthAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AuthAppStackProps) {
    super(scope, id, props);

    const { environment, jwtSecret } = props;

    // DynamoDB Table for Users
    const usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: `${environment}-auth-app-users`,
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Be careful in production
    });

    // Global Secondary Index for user ID lookup
    usersTable.addGlobalSecondaryIndex({
      indexName: "UserIdIndex",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Shared Lambda environment variables
    const lambdaEnvironment = {
      USERS_TABLE: usersTable.tableName,
      JWT_SECRET: jwtSecret,
    };

    // Lambda function common properties
    const lambdaProps = {
      runtime: lambda.Runtime.PROVIDED_AL2,
      architecture: lambda.Architecture.X86_64,
      timeout: cdk.Duration.seconds(30),
      environment: lambdaEnvironment,
    };

    // Authentication Lambda Functions
    const signUpFunction = new lambda.Function(this, "SignUpFunction", {
      ...lambdaProps,
      functionName: `${environment}-auth-signup`,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../dist/lambda/signup")
      ),
      handler: "bootstrap",
    });

    const signInFunction = new lambda.Function(this, "SignInFunction", {
      ...lambdaProps,
      functionName: `${environment}-auth-signin`,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../dist/lambda/signin")
      ),
      handler: "bootstrap",
    });

    const signOutFunction = new lambda.Function(this, "SignOutFunction", {
      ...lambdaProps,
      functionName: `${environment}-auth-signout`,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../dist/lambda/signout")
      ),
      handler: "bootstrap",
    });

    const meFunction = new lambda.Function(this, "MeFunction", {
      ...lambdaProps,
      functionName: `${environment}-auth-me`,
      code: lambda.Code.fromAsset(path.join(__dirname, "../dist/lambda/me")),
      handler: "bootstrap",
    });

    // Grant DynamoDB permissions
    usersTable.grantReadWriteData(signUpFunction);
    usersTable.grantReadData(signInFunction);
    usersTable.grantReadData(meFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, "AuthApi", {
      restApiName: `${environment}-auth-app-api`,
      description: "Minimal Authentication API",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
        ],
      },
      deployOptions: {
        stageName: environment,
      },
    });

    // API Resources and Methods
    const apiResource = api.root.addResource("api");

    // Auth endpoints
    const authResource = apiResource.addResource("auth");

    authResource
      .addResource("signup")
      .addMethod("POST", new apigateway.LambdaIntegration(signUpFunction));

    authResource
      .addResource("signin")
      .addMethod("POST", new apigateway.LambdaIntegration(signInFunction));

    authResource
      .addResource("signout")
      .addMethod("POST", new apigateway.LambdaIntegration(signOutFunction));

    // Me endpoint for protected profile access
    apiResource
      .addResource("me")
      .addMethod("GET", new apigateway.LambdaIntegration(meFunction));

    // S3 Bucket for Frontend hosting
    const frontendBucket = new s3.Bucket(this, "FrontendBucket", {
      bucketName: `${environment}-auth-app-frontend-${this.account}`,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html", // SPA routing
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(
      this,
      "FrontendDistribution",
      {
        defaultBehavior: {
          origin: new cloudfrontOrigins.S3Origin(frontendBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html", // SPA routing
            ttl: cdk.Duration.minutes(5),
          },
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html", // SPA routing
            ttl: cdk.Duration.minutes(5),
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      }
    );

    // Deploy frontend files to S3
    new s3Deployment.BucketDeployment(this, "FrontendDeployment", {
      sources: [
        s3Deployment.Source.asset(path.join(__dirname, "../../frontend/build")),
      ],
      destinationBucket: frontendBucket,
      distribution: distribution,
      distributionPaths: ["/*"],
    });

    // Outputs
    new cdk.CfnOutput(this, "ApiGatewayEndpoint", {
      value: api.url,
      description: "API Gateway endpoint URL",
      exportName: `${environment}-auth-app-api-endpoint`,
    });

    new cdk.CfnOutput(this, "UsersTableName", {
      value: usersTable.tableName,
      description: "DynamoDB Users table name",
      exportName: `${environment}-auth-app-users-table`,
    });

    new cdk.CfnOutput(this, "FrontendUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "Frontend CloudFront URL",
      exportName: `${environment}-auth-app-frontend-url`,
    });

    new cdk.CfnOutput(this, "FrontendBucketName", {
      value: frontendBucket.bucketName,
      description: "Frontend S3 bucket name",
      exportName: `${environment}-auth-app-frontend-bucket`,
    });
  }
}
