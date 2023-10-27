#!/bin/bash
set -e
echo "{\"$TOKEN_ID\":\"$TOKEN_VALUE\"}" > tokenFile.json
set -x


# Check if all required variables are set
if [[ -z "${TC_SERVER_URL}" || -z "${AGENT_NAME}" || -z "${SITE_NAME}" || -z "${USER_EMAIL}" || -z "${TOKEN_ID}" || -z "${TOKEN_VALUE}" || -z "${POOL_ID}" ]]; then
    echo "ERROR: One or more required bridge client variables are not set."
    exit 1
fi

# Start bridge client
/opt/tableau/tableau_bridge/bin/TabBridgeClientCmd setServiceConnection --service="$TC_SERVER_URL"
/opt/tableau/tableau_bridge/bin/TabBridgeClientWorker -e \ 
   --client="${AGENT_NAME}" \
   --site="${SITE_NAME}" \
   --userEmail="${USER_EMAIL}" \
   --patTokenId="${TOKEN_ID}" \
   --patTokenFile=tokenFile.json \
   --poolId="${POOL_ID}"

