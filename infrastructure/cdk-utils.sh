#!/bin/bash

# CDK utility script for common operations

set -e

ENVIRONMENT=${1:-dev}

case "${2:-help}" in
    "diff")
        echo "🔍 Showing differences for environment: $ENVIRONMENT"
        cd "$(dirname "$0")"
        npm run build
        npx cdk diff --context environment="$ENVIRONMENT"
        ;;
    "synth")
        echo "📝 Synthesizing CloudFormation template for environment: $ENVIRONMENT"
        cd "$(dirname "$0")"
        npm run build
        npx cdk synth --context environment="$ENVIRONMENT"
        ;;
    "destroy")
        echo "🗑️  Destroying stack for environment: $ENVIRONMENT"
        echo "⚠️  This will delete all resources. Are you sure? (y/N)"
        read -r confirm
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            cd "$(dirname "$0")"
            npm run build
            npx cdk destroy --force --context environment="$ENVIRONMENT"
        else
            echo "❌ Cancelled"
        fi
        ;;
    "bootstrap")
        echo "🏗️  Bootstrapping CDK for current AWS account/region"
        cd "$(dirname "$0")"
        npx cdk bootstrap
        ;;
    "logs")
        echo "📋 Available log groups for environment: $ENVIRONMENT"
        aws logs describe-log-groups --query 'logGroups[?contains(logGroupName, `'$ENVIRONMENT'-auth`)].logGroupName' --output table
        ;;
    "help"|*)
        echo "CDK Utility Script"
        echo "Usage: $0 [environment] [command]"
        echo ""
        echo "Commands:"
        echo "  diff      - Show differences between deployed and current stack"
        echo "  synth     - Synthesize CloudFormation template"
        echo "  destroy   - Destroy the stack (destructive)"
        echo "  bootstrap - Bootstrap CDK for the account/region"
        echo "  logs      - List CloudWatch log groups"
        echo "  help      - Show this help message"
        echo ""
        echo "Environment: $ENVIRONMENT (default: dev)"
        ;;
esac