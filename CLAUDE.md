# Mishi Project

## Overview
This is a project hosted at `demo.tuck.family/mishi`. It will be a React-based web application deployed to AWS via S3 + CloudFront.

## AWS Setup
- **Account:** 965619576067
- **Profile:** `tuck-family` (AWS SSO)
- **Region:** us-east-1
- **Domain:** demo.tuck.family/mishi
- **S3 Bucket:** `demo.tuck.family` (project files go in `/mishi/` prefix)
- **CloudFront:** Serves demo.tuck.family with HTTPS, OAC for S3 access
- **Route53 Hosted Zone:** Z08086322RZ42JE4OZ494 (tuck.family)

## Scripts
- `authenticate.sh` — AWS SSO login (run first)
- `setup-demo-infra.sh` — Creates/verifies all AWS infrastructure (idempotent)

## Deploying
1. Run `./authenticate.sh` to ensure AWS credentials are active
2. Build the app with base path `/mishi/` (e.g., `vite build --base=/mishi/`)
3. Sync: `aws s3 sync ./dist/ s3://demo.tuck.family/mishi/ --delete --profile tuck-family`
4. Invalidate cache: `aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths '/mishi/*' --profile tuck-family`

## Infrastructure Details
See `demo-subdomain.md` for full architecture and resource reference.

## Conventions
- All AWS CLI commands use `--profile tuck-family`
- Infrastructure scripts are idempotent (safe to re-run)
- The S3 bucket is shared across projects (mishi, poketrader, etc.) using path prefixes
- SPA routing is handled by CloudFront custom error responses (403/404 → /index.html)
