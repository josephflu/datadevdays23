#!/bin/bash
set -o errexit; set -o nounset
echo "{\"$TOKEN_ID\":\"$TOKEN_VALUE\"}" > tokenFile.json
set -o xtrace

/opt/tableau/tableau_bridge/bin/TabBridgeClientCmd setServiceConnection --service="$TC_SERVER_URL"
/opt/tableau/tableau_bridge/bin/TabBridgeClientWorker -e --client="${AGENT_NAME}" \
   --site="${SITE_NAME}" \
   --userEmail="${USER_EMAIL}" \
   --patTokenId="${TOKEN_ID}" \
   --patTokenFile=tokenFile.json \
   --poolId="${POOL_ID}"

