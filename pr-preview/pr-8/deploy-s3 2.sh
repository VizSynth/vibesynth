#!/bin/bash
# AWS S3 Deployment Script for VibeSynth
# This script deploys the VibeSynth application to AWS S3 with CloudFront invalidation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${AWS_S3_BUCKET:-vibesynth-app}"
CLOUDFRONT_DISTRIBUTION_ID="${AWS_CLOUDFRONT_DISTRIBUTION_ID:-}"
REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}🚀 VibeSynth AWS S3 Deployment${NC}"
echo "=================================="

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

# Sync files to S3
echo -e "${BLUE}📦 Syncing files to S3...${NC}"

aws s3 sync . "s3://${BUCKET_NAME}" \
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
aws s3 cp "s3://${BUCKET_NAME}/index.html" "s3://${BUCKET_NAME}/index.html" \
    --content-type "text/html" \
    --metadata-directive REPLACE

# Set CSS content type
aws s3 cp "s3://${BUCKET_NAME}/style.css" "s3://${BUCKET_NAME}/style.css" \
    --content-type "text/css" \
    --metadata-directive REPLACE

# Set JavaScript content type
aws s3 cp "s3://${BUCKET_NAME}/script.js" "s3://${BUCKET_NAME}/script.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

aws s3 cp "s3://${BUCKET_NAME}/layout.js" "s3://${BUCKET_NAME}/layout.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

aws s3 cp "s3://${BUCKET_NAME}/test-suite.js" "s3://${BUCKET_NAME}/test-suite.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

echo -e "${GREEN}✅ Content types configured${NC}"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
    echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
        --paths "/*" > /dev/null
    echo -e "${GREEN}✅ CloudFront cache invalidated${NC}"
fi

# Display website URL
WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"
echo ""
echo -e "${GREEN}🎉 VibeSynth deployed successfully!${NC}"
echo -e "${BLUE}Website URL: ${WEBSITE_URL}${NC}"

if [ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
    echo -e "${BLUE}CloudFront URL: Check your CloudFront distribution${NC}"
fi

echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "1. Configure a custom domain (optional)"
echo "2. Set up CloudFront for better performance and HTTPS"
echo "3. Configure AWS_S3_BUCKET environment variable in GitHub Actions"
echo ""