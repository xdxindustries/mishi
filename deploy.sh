#!/usr/bin/env bash
set -euo pipefail

PROFILE="tuck-family"
BUCKET="demo.tuck.family"
PREFIX="mishi"
DISTRIBUTION_ID="E37F4A29F93YX2"
BASE_PATH="/${PREFIX}/"

echo "Building..."
npm run build -- --base="${BASE_PATH}"

echo "Syncing to s3://${BUCKET}/${PREFIX}/..."
aws s3 sync ./dist/ "s3://${BUCKET}/${PREFIX}/" --delete --profile "${PROFILE}"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/${PREFIX}/*" \
  --profile "${PROFILE}" \
  --output text

echo "Deployed to https://${BUCKET}/${BASE_PATH}"
