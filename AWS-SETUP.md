# AWS S3 Complete Hosting Setup for VibeSynth

This guide will help you deploy VibeSynth entirely on AWS S3 with CloudFront CDN, replacing GitHub Pages completely. Includes production hosting for vibesynth.one and automatic PR previews.

## Overview

VibeSynth uses AWS S3 + CloudFront for complete hosting, providing:
- **Fast global delivery** with CloudFront CDN and S3's robust infrastructure
- **Cost-effective hosting** (~$2/month for production + unlimited PR previews)
- **Automatic PR previews** with custom subdomains (pr-123.vibesynth.one)
- **Production hosting** for vibesynth.one via CloudFront + Route 53
- **Instant deployments** with cache invalidation and automated cleanup
- **No GitHub Pages limitations** - full control over hosting

## Prerequisites

1. **AWS Account** - You'll need an active AWS account
2. **AWS CLI** - Install and configure the AWS Command Line Interface
3. **GitHub Repository** - Your VibeSynth code in a GitHub repository

## Quick Start

### 1. Install AWS CLI

```bash
# macOS (using Homebrew)
brew install awscli

# Windows (using pip)
pip install awscli

# Linux (using package manager)
sudo apt-get install awscli  # Ubuntu/Debian
sudo yum install awscli      # CentOS/RHEL
```

### 2. Configure AWS Credentials

```bash
aws configure
```

You'll need:
- **AWS Access Key ID**
- **AWS Secret Access Key** 
- **Default region** (e.g., `us-east-1`)
- **Default output format** (choose `json`)

### 3. Deploy Manually (First Time)

```bash
# Make the deployment script executable
chmod +x deploy-s3.sh

# Run deployment (will create bucket if it doesn't exist)
./deploy-s3.sh
```

The script will:
- Create an S3 bucket (if it doesn't exist)
- Configure it for static website hosting
- Upload all your files
- Set proper content types and cache headers
- Display the website URL when complete

## Environment Variables

The deployment scripts use these environment variables:

### Production & Staging
| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_S3_BUCKET_PRODUCTION` | Production S3 bucket | `vibesynth-production` |
| `AWS_S3_BUCKET_STAGING` | Staging S3 bucket | `vibesynth-staging` |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION` | Production CloudFront ID | - |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID_STAGING` | Staging CloudFront ID | - |

### PR Previews
| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_S3_BUCKET_PR_PREVIEWS` | PR previews S3 bucket | `vibesynth-pr-previews` |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID_PREVIEWS` | PR previews CloudFront ID | - |
| `AWS_REGION` | AWS region for all buckets | `us-east-1` |

### Example with custom settings:

```bash
AWS_S3_BUCKET=my-vibesynth-site AWS_REGION=us-west-2 ./deploy-s3.sh
```

## GitHub Actions Automation

### Setting up Automated Deployments

1. **Configure AWS IAM Role** (Recommended - more secure than access keys)

Create an IAM role with these policies:
- `AmazonS3FullAccess` (or a custom policy for your specific buckets)
- `CloudFrontFullAccess` (if using CloudFront)

2. **Add GitHub Repository Variables**

Go to your GitHub repo → Settings → Secrets and variables → Actions

**Repository Variables:**
```
AWS_REGION=us-east-1
AWS_S3_BUCKET_STAGING=vibesynth-staging
AWS_S3_BUCKET_PRODUCTION=vibesynth-production
AWS_S3_BUCKET_PR_PREVIEWS=vibesynth-pr-previews
AWS_CLOUDFRONT_DISTRIBUTION_ID_STAGING=E1234567890123
AWS_CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION=E0987654321098
AWS_CLOUDFRONT_DISTRIBUTION_ID_PREVIEWS=E1111111111111
```

**Repository Secrets:**
```
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/vibesynth-deploy-role
```

### Deployment Triggers

The GitHub Actions workflows will automatically deploy:

- **PR Previews**: When you open/update a pull request → `pr-123.vibesynth.one`
- **Staging**: When you push to the `main` branch → staging S3 bucket
- **Production**: When you create a GitHub release → `vibesynth.one` 
- **Manual**: You can trigger deployments manually with environment selection

### PR Preview System

**Automatic PR Previews** are deployed to S3 with the following features:

- **Custom URLs**: Each PR gets `pr-{number}.vibesynth.one` (e.g., `pr-456.vibesynth.one`)
- **Instant Updates**: Every commit to the PR automatically updates the preview
- **Auto Comments**: GitHub bot comments the preview URL on each PR
- **Auto Cleanup**: When PR is closed, preview is automatically deleted from S3
- **S3 Bucket Structure**: `s3://vibesynth-pr-previews/pr-123/` (isolated per PR)

## CloudFront Setup (Required for Custom Domains)

CloudFront is **required** for the complete VibeSynth hosting setup and provides:
- **HTTPS** support with free SSL certificates
- **Custom domain** support for vibesynth.one and PR previews
- **Better performance** with global edge locations  
- **Advanced caching** controls and instant cache invalidation

### Complete Hosting Architecture

**Three S3 Buckets + CloudFront Distributions:**

1. **Production**: `vibesynth-production` → CloudFront → `vibesynth.one`
2. **Staging**: `vibesynth-staging` → CloudFront → `staging.vibesynth.one`  
3. **PR Previews**: `vibesynth-pr-previews` → CloudFront → `pr-*.vibesynth.one`

### CloudFront Setup (Required for each environment):

**For each bucket, create a CloudFront Distribution:**

1. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket website URL (e.g., `vibesynth-production.s3-website-us-east-1.amazonaws.com`)
   - Viewer Protocol Policy: "Redirect HTTP to HTTPS"
   - Allowed HTTP Methods: GET, HEAD, OPTIONS
   - Cache Policy: "Caching Optimized"
   - Alternate Domain Names (CNAMEs): Add your custom domains

2. **Configure Custom Error Pages** (for SPA routing):
   - Error Code: 403, 404
   - Response Page Path: `/index.html`
   - Response Code: 200

3. **Add Distribution IDs** to your GitHub variables:
   ```
   AWS_CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION=E1234567890123
   AWS_CLOUDFRONT_DISTRIBUTION_ID_STAGING=E2345678901234
   AWS_CLOUDFRONT_DISTRIBUTION_ID_PREVIEWS=E3456789012345
   ```

## Custom Domain Setup

### Using Route 53 (AWS DNS) for vibesynth.one:

**Complete DNS Setup for VibeSynth:**

1. **SSL Certificate** (AWS Certificate Manager):
   - Request certificate for `vibesynth.one` and `*.vibesynth.one`
   - This covers production, staging, and all PR previews

2. **Route 53 DNS Records**:
   ```bash
   # Production
   A     vibesynth.one.           → CloudFront Distribution (Production)
   
   # Staging  
   CNAME staging.vibesynth.one.   → CloudFront Distribution (Staging)
   
   # PR Previews (wildcard)
   CNAME *.vibesynth.one.         → CloudFront Distribution (PR Previews)
   ```

3. **Update CloudFront distributions** to use custom domains and SSL certificate

### Using External DNS:

1. **Create a CNAME record** pointing to your CloudFront distribution
2. **Configure CloudFront** with your custom domain
3. **Request SSL certificate** and validate domain ownership

## Costs

AWS S3 and CloudFront are very cost-effective for static websites:

### Complete VibeSynth Hosting Costs (Monthly):

**S3 Storage & Requests (3 buckets):**
- Production Storage (1GB): ~$0.02
- Staging Storage (1GB): ~$0.02  
- PR Previews Storage (2GB): ~$0.05
- Requests (50,000 total): ~$0.05
- **Total S3**: ~$0.14/month

**CloudFront (3 distributions):**
- Production Data Transfer (10GB): ~$0.85
- Staging Data Transfer (2GB): ~$0.17
- PR Previews Data Transfer (5GB): ~$0.43
- Requests (200,000 total): ~$0.02
- **Total CloudFront**: ~$1.47/month

**Route 53:**
- Hosted Zone: ~$0.50/month
- DNS Queries (1M): ~$0.40/month

**Total estimated cost: ~$2.51/month** for production + unlimited PR previews

## Security Best Practices

1. **Use IAM Roles** instead of access keys for GitHub Actions
2. **Limit S3 bucket permissions** to only what's needed for public read access
3. **Enable CloudFront** for HTTPS and better security headers
4. **Regular security audits** of your AWS resources

## Troubleshooting

### Common Issues:

**1. "Access Denied" when creating bucket:**
- Check your AWS credentials have S3 permissions
- Ensure bucket name is globally unique
- Verify region is correct

**2. "Website not loading":**
- Check S3 bucket policy allows public read access
- Verify static website hosting is enabled
- Ensure index.html exists in bucket root

**3. "CloudFront not updating":**
- CloudFront caches content - create an invalidation
- The deployment script automatically invalidates cache
- Can take 10-15 minutes for changes to propagate

**4. "GitHub Actions failing":**
- Verify AWS_ROLE_ARN secret is correct
- Check repository variables are set
- Ensure IAM role has necessary permissions

### Getting Help:

- Check AWS CloudWatch logs for detailed error messages
- Review GitHub Actions logs for deployment issues
- AWS documentation: https://docs.aws.amazon.com/s3/
- CloudFront documentation: https://docs.aws.amazon.com/cloudfront/

## Advanced Configuration

### Custom Deployment Script

You can customize `deploy-s3.sh` for your needs:

```bash
# Add custom file exclusions
--exclude "*.backup" \
--exclude "development/*" \

# Custom cache headers
--cache-control "text/html:max-age=300" \      # 5 minutes for HTML
--cache-control "text/css:max-age=31536000" \  # 1 year for CSS
--cache-control "application/javascript:max-age=31536000" \ # 1 year for JS
```

### Multiple Environments

You can set up multiple environments:

```bash
# Staging
AWS_S3_BUCKET=vibesynth-staging ./deploy-s3.sh

# Production  
AWS_S3_BUCKET=vibesynth-production ./deploy-s3.sh

# Development
AWS_S3_BUCKET=vibesynth-dev ./deploy-s3.sh
```

## Next Steps

1. **Set up monitoring** with AWS CloudWatch
2. **Configure backup** strategies for your S3 buckets  
3. **Implement CI/CD** testing before deployment
4. **Set up staging environment** for testing changes
5. **Monitor costs** with AWS Cost Explorer

---

## Quick Reference Commands

```bash
# Production deployment
AWS_S3_BUCKET=vibesynth-production ./deploy-s3.sh

# Staging deployment
AWS_S3_BUCKET=vibesynth-staging ./deploy-s3.sh

# Deploy PR preview
PR_NUMBER=123 ./deploy-s3-pr-preview.sh

# Cleanup PR preview
PR_NUMBER=123 ACTION=cleanup ./deploy-s3-pr-preview.sh

# Check deployments
aws s3 ls s3://vibesynth-production/
aws s3 ls s3://vibesynth-pr-previews/

# View websites
echo "https://vibesynth.one"
echo "https://staging.vibesynth.one" 
echo "https://pr-123.vibesynth.one"
```

Happy deploying! 🚀