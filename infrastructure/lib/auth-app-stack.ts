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

    const usersTable = new dynamodb.Table(this, "UsersTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Be careful in production
      tableName: `${environment}-auth-app-users`,
    });

    usersTable.addGlobalSecondaryIndex({
      indexName: "UserIdIndex",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const lambdaEnvironment = {
      JWT_SECRET: jwtSecret,
      USERS_TABLE: usersTable.tableName,
    };

    const lambdaProps = {
      architecture: lambda.Architecture.X86_64,
      environment: lambdaEnvironment,
      runtime: lambda.Runtime.PROVIDED_AL2,
      timeout: cdk.Duration.seconds(30),
    };

    const signUpFunction = new lambda.Function(this, "SignUpFunction", {
      ...lambdaProps,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../dist/lambda/signup")
      ),
      functionName: `${environment}-auth-signup`,
      handler: "bootstrap",
    });

    const signInFunction = new lambda.Function(this, "SignInFunction", {
      ...lambdaProps,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../dist/lambda/signin")
      ),
      functionName: `${environment}-auth-signin`,
      handler: "bootstrap",
    });

    const signOutFunction = new lambda.Function(this, "SignOutFunction", {
      ...lambdaProps,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../dist/lambda/signout")
      ),
      functionName: `${environment}-auth-signout`,
      handler: "bootstrap",
    });

    const meFunction = new lambda.Function(this, "MeFunction", {
      ...lambdaProps,
      code: lambda.Code.fromAsset(path.join(__dirname, "../dist/lambda/me")),
      functionName: `${environment}-auth-me`,
      handler: "bootstrap",
    });

    usersTable.grantReadWriteData(signUpFunction);
    usersTable.grantReadData(signInFunction);
    usersTable.grantReadData(meFunction);

    const api = new apigateway.RestApi(this, "AuthApi", {
      restApiName: `${environment}-auth-app-api`,
      description: "Minimal Authentication API",
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Authorization",
          "Content-Type",
          "X-Amz-Date",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
          "X-Api-Key",
        ],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
      deployOptions: {
        stageName: environment,
      },
    });

    const apiResource = api.root.addResource("api");
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

    apiResource
      .addResource("me")
      .addMethod("GET", new apigateway.LambdaIntegration(meFunction));

    const frontendBucket = new s3.Bucket(this, "FrontendBucket", {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      bucketName: `${environment}-auth-app-frontend-${this.account}`,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteErrorDocument: "index.html",
      websiteIndexDocument: "index.html",
    });

    const distribution = new cloudfront.Distribution(
      this,
      "FrontendDistribution",
      {
        defaultBehavior: {
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          origin: new cloudfrontOrigins.S3Origin(frontendBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: cdk.Duration.minutes(5),
          },
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: cdk.Duration.minutes(5),
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      }
    );

    new s3Deployment.BucketDeployment(this, "FrontendDeployment", {
      destinationBucket: frontendBucket,
      distribution: distribution,
      distributionPaths: ["/*"],
      sources: [
        s3Deployment.Source.asset(path.join(__dirname, "../../frontend/build")),
      ],
    });

    new cdk.CfnOutput(this, "ApiGatewayEndpoint", {
      description: "API Gateway endpoint URL",
      exportName: `${environment}-auth-app-api-endpoint`,
      value: api.url,
    });

    new cdk.CfnOutput(this, "UsersTableName", {
      description: "DynamoDB Users table name",
      exportName: `${environment}-auth-app-users-table`,
      value: usersTable.tableName,
    });

    new cdk.CfnOutput(this, "FrontendUrl", {
      description: "Frontend CloudFront URL",
      exportName: `${environment}-auth-app-frontend-url`,
      value: `https://${distribution.distributionDomainName}`,
    });

    new cdk.CfnOutput(this, "FrontendBucketName", {
      description: "Frontend S3 bucket name",
      exportName: `${environment}-auth-app-frontend-bucket`,
      value: frontendBucket.bucketName,
    });
  }
}
