# AWS S3 Deployment Setup for VibeSynth

This guide will help you deploy VibeSynth to AWS S3 for fast, reliable hosting with optional CloudFront CDN integration.

## Overview

VibeSynth can be deployed to AWS S3 as a static website, providing:
- **Fast global delivery** with S3's robust infrastructure
- **Cost-effective hosting** for static web applications
- **Scalability** to handle traffic spikes
- **Optional CloudFront CDN** for even better performance and HTTPS
- **Automated deployments** via GitHub Actions

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

The deployment script uses these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_S3_BUCKET` | S3 bucket name | `vibesynth-app` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (optional) | - |

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
AWS_CLOUDFRONT_DISTRIBUTION_ID_STAGING=E1234567890123  # Optional
AWS_CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION=E0987654321098  # Optional
```

**Repository Secrets:**
```
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/vibesynth-deploy-role
```

### Deployment Triggers

The GitHub Actions workflow will automatically deploy:

- **Staging**: When you push to the `main` branch
- **Production**: When you create a GitHub release
- **Manual**: You can trigger deployments manually with environment selection

## CloudFront Setup (Optional but Recommended)

CloudFront provides:
- **HTTPS** support with free SSL certificates
- **Better performance** with global edge locations
- **Custom domain** support
- **Advanced caching** controls

### Quick CloudFront Setup:

1. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket website URL
   - Viewer Protocol Policy: "Redirect HTTP to HTTPS"
   - Allowed HTTP Methods: GET, HEAD, OPTIONS
   - Cache Policy: "Caching Optimized"

2. **Configure Custom Error Pages**:
   - Error Code: 403, 404
   - Response Page Path: `/index.html`
   - Response Code: 200

3. **Add Distribution ID** to your GitHub variables:
   ```
   AWS_CLOUDFRONT_DISTRIBUTION_ID_STAGING=E1234567890123
   ```

## Custom Domain Setup

### Using Route 53 (AWS DNS):

1. **Register or transfer your domain** to Route 53
2. **Create an A record** (alias) pointing to your CloudFront distribution
3. **Request SSL certificate** in AWS Certificate Manager
4. **Update CloudFront** to use your custom domain and SSL certificate

### Using External DNS:

1. **Create a CNAME record** pointing to your CloudFront distribution
2. **Configure CloudFront** with your custom domain
3. **Request SSL certificate** and validate domain ownership

## Costs

AWS S3 and CloudFront are very cost-effective for static websites:

### Typical Monthly Costs for VibeSynth:

**S3 Storage & Requests:**
- Storage (1GB): ~$0.02
- Requests (10,000): ~$0.01
- **Total S3**: ~$0.03/month

**CloudFront (Optional):**
- Data Transfer (10GB): ~$0.85
- Requests (100,000): ~$0.01
- **Total CloudFront**: ~$0.86/month

**Total estimated cost: ~$0.89/month** for moderate traffic

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
# Deploy to default bucket
./deploy-s3.sh

# Deploy to custom bucket
AWS_S3_BUCKET=my-custom-bucket ./deploy-s3.sh

# Deploy with CloudFront invalidation
AWS_CLOUDFRONT_DISTRIBUTION_ID=E1234567890123 ./deploy-s3.sh

# Check deployment
aws s3 ls s3://your-bucket-name

# View website
echo "http://your-bucket-name.s3-website-us-east-1.amazonaws.com"
```

Happy deploying! 🚀