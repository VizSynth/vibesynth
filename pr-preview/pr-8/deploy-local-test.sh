#!/bin/bash
# Local S3 Deployment Test Script
# This script tests the S3 deployment process locally with dry-run options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BUCKET_NAME="${AWS_S3_BUCKET:-vibesynth-test-$(date +%s)}"
REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}🧪 VibeSynth S3 Deployment Test${NC}"
echo "====================================="
echo "Bucket: ${BUCKET_NAME}"
echo "Region: ${REGION}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "This is a test script - install AWS CLI to run actual deployments"
    echo "Install with: pip install awscli"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "This is a test script - configure AWS CLI to run actual deployments"
    echo "Configure with: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"
echo "Account: $(aws sts get-caller-identity --query Account --output text)"
echo ""

# Dry run - show what would be uploaded
echo -e "${BLUE}📋 Files that would be uploaded:${NC}"
echo "--------------------------------"

find . -type f \
    ! -path "./.git/*" \
    ! -path "./.github/*" \
    ! -path "./node_modules/*" \
    ! -path "./test-results/*" \
    ! -path "./playwright-report/*" \
    ! -path "./checkpoint-*" \
    ! -name "*.md" \
    ! -name "*.sh" \
    ! -name "temp-*" \
    | sort

echo ""
echo -e "${YELLOW}📊 Upload Summary:${NC}"
TOTAL_FILES=$(find . -type f ! -path "./.git/*" ! -path "./.github/*" ! -path "./node_modules/*" ! -path "./test-results/*" ! -path "./playwright-report/*" ! -path "./checkpoint-*" ! -name "*.md" ! -name "*.sh" ! -name "temp-*" | wc -l)
TOTAL_SIZE=$(find . -type f ! -path "./.git/*" ! -path "./.github/*" ! -path "./node_modules/*" ! -path "./test-results/*" ! -path "./playwright-report/*" ! -path "./checkpoint-*" ! -name "*.md" ! -name "*.sh" ! -name "temp-*" -exec du -bc {} + 2>/dev/null | tail -1 | cut -f1)

echo "Total files: ${TOTAL_FILES}"
echo "Total size: $(numfmt --to=iec-i --suffix=B ${TOTAL_SIZE})"
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️  Do you want to proceed with actual deployment? (y/N)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${BLUE}🚀 Proceeding with deployment...${NC}"
    ./deploy-s3.sh
else
    echo -e "${GREEN}✅ Test completed - no actual deployment performed${NC}"
    echo ""
    echo -e "${BLUE}💡 To deploy for real:${NC}"
    echo "1. Review the file list above"
    echo "2. Set environment variables if needed:"
    echo "   export AWS_S3_BUCKET=your-bucket-name"
    echo "   export AWS_REGION=your-preferred-region"
    echo "3. Run: ./deploy-s3.sh"
    echo ""
    echo -e "${YELLOW}🔍 Or test again with:${NC}"
    echo "./deploy-local-test.sh"
fi