#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthAppStack } from '../lib/auth-app-stack';

const app = new cdk.App();

// Get environment and JWT secret from context or environment variables
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';
const jwtSecret = app.node.tryGetContext('jwtSecret') || process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be provided via context or environment variable');
}

new AuthAppStack(app, `AuthAppStack-${environment}`, {
  environment,
  jwtSecret,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});