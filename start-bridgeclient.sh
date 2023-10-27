#!/bin/bash
set -e -x

POOL_ID=$(yq '.bridge.pool_id' source.yml)
SITE_NAME=$(yq '.bridge.site_name' source.yml)
USER_EMAIL=$(yq '.bridge.user_email' source.yml)
PATTOKENID=$(yq '.tokens[0].name' source.yml)
SERVER_URL=$(yq '.bridge.pod_url' source.yml)
export PATTOKENFILE="/home/tableau/pat"

TOKEN=$(yq '.tokens[0].secret' source.yml)
cat <<EOF >${PATTOKENFILE}
{
  "$PATTOKENID" : "$TOKEN"
}
EOF
chmod 600 ${PATTOKENFILE}

export POOL_ID SITE_NAME USER_EMAIL PATTOKENID SERVER_URL
export CLIENT=$HOSTNAME

/opt/tableau/tableau_bridge/bin/TabBridgeClientCmd setServiceConnection \
    --service="https://${SERVER_URL}"

/opt/tableau/tableau_bridge/bin/TabBridgeClientWorker -e \
    --client="${CLIENT}" \
    --site="${SITE_NAME}" \
    --userEmail="${USER_EMAIL}" \
    --patTokenId="${PATTOKENID}" \
    --patTokenFile="${PATTOKENFILE}" \
    --poolId="${POOL_ID}"
