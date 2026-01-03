#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";

import { AuthAppStack } from "../lib/auth-app-stack";

const app = new cdk.App();

const environment =
  app.node.tryGetContext("environment") || process.env.ENVIRONMENT || "dev";
const jwtSecret = app.node.tryGetContext("jwtSecret") || process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET must be provided via context or environment variable"
  );
}

new AuthAppStack(app, `AuthAppStack-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  environment,
  jwtSecret,
});
