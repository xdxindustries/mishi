#!/bin/bash
set -e

PROFILE="tuck-family"
SSO_SESSION="tuck-family-sso"
SSO_START_URL="https://d-9267ab5eac.awsapps.com/start"
SSO_REGION="us-east-1"
ACCOUNT_ID="965619576067"
ROLE_NAME="AdministratorAccess"
REGION="us-east-1"

# Ensure the sso-session and profile exist in ~/.aws/config
if ! grep -q "\[profile ${PROFILE}\]" ~/.aws/config 2>/dev/null; then
  echo "Adding '${PROFILE}' profile to ~/.aws/config..."
  cat >> ~/.aws/config <<EOF

[sso-session ${SSO_SESSION}]
sso_start_url = ${SSO_START_URL}
sso_region = ${SSO_REGION}
sso_registration_scopes = sso:account:access

[profile ${PROFILE}]
sso_session = ${SSO_SESSION}
sso_account_id = ${ACCOUNT_ID}
sso_role_name = ${ROLE_NAME}
region = ${REGION}
EOF
  echo "Profile added."
else
  echo "Profile '${PROFILE}' already exists in ~/.aws/config."
fi

# Log in via SSO
echo "Logging in with AWS SSO (profile: ${PROFILE})..."
aws sso login --profile "${PROFILE}"

# Verify access
echo ""
echo "Verifying credentials..."
aws sts get-caller-identity --profile "${PROFILE}"

echo ""
echo "Authenticated successfully! Use --profile ${PROFILE} or:"
echo "  export AWS_PROFILE=${PROFILE}"
