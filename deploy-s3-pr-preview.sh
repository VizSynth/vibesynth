#!/bin/bash
# AWS S3 PR Preview Deployment Script for VibeSynth
# This script deploys PR previews to S3 with automatic cleanup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - use environment variables or defaults
PR_NUMBER="${PR_NUMBER:-}"
BUCKET_NAME="${AWS_S3_BUCKET_PR_PREVIEWS:-vibesynth-pr-previews}"
CLOUDFRONT_DISTRIBUTION_ID="${AWS_CLOUDFRONT_DISTRIBUTION_ID_PREVIEWS:-}"
REGION="${AWS_REGION:-us-east-1}"
ACTION="${ACTION:-deploy}" # deploy or cleanup

if [ -z "$PR_NUMBER" ]; then
    echo -e "${RED}❌ PR_NUMBER environment variable is required${NC}"
    echo "Usage: PR_NUMBER=123 ./deploy-s3-pr-preview.sh"
    echo "   or: PR_NUMBER=123 ACTION=cleanup ./deploy-s3-pr-preview.sh"
    exit 1
fi

echo -e "${BLUE}🚀 VibeSynth S3 PR Preview ${ACTION^}${NC}"
echo "========================================"
echo "PR Number: ${PR_NUMBER}"
echo "Bucket: ${BUCKET_NAME}"
echo "Region: ${REGION}"
echo "Action: ${ACTION}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Install with: pip install awscli"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"

if [ "$ACTION" = "cleanup" ]; then
    echo -e "${YELLOW}🗑️ Cleaning up PR #${PR_NUMBER} preview...${NC}"
    
    # Remove PR folder from S3
    aws s3 rm "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/" --recursive
    echo -e "${GREEN}✅ Removed s3://${BUCKET_NAME}/pr-${PR_NUMBER}/${NC}"
    
    # Invalidate CloudFront cache if distribution ID is provided
    if [ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
        echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
        aws cloudfront create-invalidation \
            --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
            --paths "/pr-${PR_NUMBER}/*" > /dev/null
        echo -e "${GREEN}✅ CloudFront cache invalidated${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 PR #${PR_NUMBER} preview cleaned up successfully!${NC}"
    exit 0
fi

# Deploy mode
echo -e "${BLUE}📦 Deploying PR #${PR_NUMBER} to S3...${NC}"

# Check if bucket exists, create if it doesn't
if ! aws s3 ls "s3://${BUCKET_NAME}" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Bucket ${BUCKET_NAME} doesn't exist. Creating...${NC}"
    aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}"
    
    # Configure bucket for static website hosting
    aws s3 website "s3://${BUCKET_NAME}" --index-document index.html --error-document index.html
    
    # Set bucket policy for public read access
    BUCKET_POLICY=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF
)
    echo "${BUCKET_POLICY}" > temp-bucket-policy.json
    aws s3api put-bucket-policy --bucket "${BUCKET_NAME}" --policy file://temp-bucket-policy.json
    rm temp-bucket-policy.json
    
    echo -e "${GREEN}✅ Bucket created and configured for static website hosting${NC}"
else
    echo -e "${GREEN}✅ Bucket ${BUCKET_NAME} exists${NC}"
fi

# Sync files to S3 with PR-specific path
aws s3 sync . "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/" \
    --delete \
    --exclude ".git/*" \
    --exclude ".github/*" \
    --exclude "node_modules/*" \
    --exclude "test-results/*" \
    --exclude "playwright-report/*" \
    --exclude "checkpoint-*" \
    --exclude "*.md" \
    --exclude "*.sh" \
    --exclude "temp-*" \
    --cache-control "text/html:max-age=300" \
    --cache-control "text/css:max-age=31536000" \
    --cache-control "application/javascript:max-age=31536000" \
    --cache-control "image/*:max-age=31536000"

echo -e "${GREEN}✅ Files synced to S3${NC}"

# Set correct content types for specific files
echo -e "${BLUE}🔧 Setting content types...${NC}"

# Set HTML content type
aws s3 cp "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/index.html" "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/index.html" \
    --content-type "text/html" \
    --metadata-directive REPLACE

# Set CSS content type
aws s3 cp "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/style.css" "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/style.css" \
    --content-type "text/css" \
    --metadata-directive REPLACE

# Set JavaScript content types
for js_file in script.js layout.js test-suite.js; do
    if aws s3 ls "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/${js_file}" > /dev/null 2>&1; then
        aws s3 cp "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/${js_file}" "s3://${BUCKET_NAME}/pr-${PR_NUMBER}/${js_file}" \
            --content-type "application/javascript" \
            --metadata-directive REPLACE
    fi
done

echo -e "${GREEN}✅ Content types configured${NC}"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
    echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
        --paths "/pr-${PR_NUMBER}/*" > /dev/null
    echo -e "${GREEN}✅ CloudFront cache invalidated${NC}"
fi

# Display preview URLs
WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com/pr-${PR_NUMBER}/"
CUSTOM_URL=""
if [ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
    CUSTOM_URL="https://pr-${PR_NUMBER}.vibesynth.one"
fi

echo ""
echo -e "${GREEN}🎉 PR #${PR_NUMBER} preview deployed successfully!${NC}"
echo -e "${BLUE}S3 Website URL: ${WEBSITE_URL}${NC}"
if [ -n "${CUSTOM_URL}" ]; then
    echo -e "${BLUE}Custom Domain URL: ${CUSTOM_URL}${NC}"
fi

echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "1. Access the preview URL above"
echo "2. Test the PR changes in the live environment"
if [ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
    echo "3. CloudFront may take a few minutes to propagate changes"
fi
echo ""
echo -e "${YELLOW}🗑️ To cleanup later:${NC}"
echo "PR_NUMBER=${PR_NUMBER} ACTION=cleanup ./deploy-s3-pr-preview.sh"
echo ""