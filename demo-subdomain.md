# demo.tuck.family Infrastructure

## Architecture

Single S3 bucket + single CloudFront distribution serving `demo.tuck.family`.
Each project is deployed to a subfolder in the S3 bucket (e.g., `/mishi/`, `/poketrader/`).

```
Browser → demo.tuck.family → CloudFront → S3 (demo.tuck.family bucket)
                                              ├── /mishi/
                                              └── /poketrader/
```

## AWS Resources

| Resource | Value |
|---|---|
| AWS Account | 965619576067 |
| AWS Profile | `tuck-family` |
| Region | us-east-1 |
| S3 Bucket | `demo.tuck.family` |
| Route53 Hosted Zone | `Z08086322RZ42JE4OZ494` (tuck.family) |
| ACM Certificate | DNS-validated cert for `demo.tuck.family` (us-east-1) |
| CloudFront | Distribution with OAC (`demo-tuck-family-oac`) |

## Scripts

### `authenticate.sh`
Authenticates via AWS SSO. Run before any AWS commands.
```bash
./authenticate.sh
```

### `setup-demo-infra.sh`
Creates all infrastructure (idempotent — safe to re-run):
- ACM certificate with DNS validation
- S3 bucket (public access blocked)
- CloudFront OAC + distribution
- Route53 A alias record

```bash
./setup-demo-infra.sh
```

## Deploying a Project

### 1. Build the React app

For projects served at a subpath, set the base/public URL before building:

**Vite:**
```bash
vite build --base=/mishi/
```

**Create React App:**
```bash
PUBLIC_URL=/mishi/ npm run build
```

### 2. Sync to S3
```bash
aws s3 sync ./dist/ s3://demo.tuck.family/mishi/ --delete --profile tuck-family
```

### 3. Invalidate CloudFront cache
```bash
# Get the distribution ID
DIST_ID=$(aws cloudfront list-distributions --profile tuck-family \
  --query "DistributionList.Items[?Aliases.Items[0]=='demo.tuck.family'].Id" --output text)

aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths '/mishi/*' --profile tuck-family
```

## Adding a New Project

1. Build with the correct base path (e.g., `--base=/newproject/`)
2. Sync to `s3://demo.tuck.family/newproject/`
3. Invalidate the CloudFront cache for `/newproject/*`

No infrastructure changes needed — just upload to a new folder.

## SPA Routing

CloudFront is configured with custom error responses that redirect 403/404 errors to `/index.html` with a 200 status. This enables client-side routing for React SPAs.

**Note:** This global fallback works well for a single project. If multiple projects need independent SPA routing, consider using CloudFront Functions to rewrite paths per project prefix.

## HTTPS

HTTPS is enforced via CloudFront (HTTP → HTTPS redirect). The ACM certificate is free and auto-renews as long as the DNS validation CNAME record remains in Route53.
