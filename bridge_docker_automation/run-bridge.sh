#!/bin/bash
set -o errexit; set -o nounset

######
# Loop $NUM_AGENTS times and create an .env file and start a docker container
######

if [[ ! -f bridge_config.yml ]]; then
  echo "Config file bridge_config.yml is absent"
  exit 1
fi

if [[ -z $NUM_AGENTS ]]; then
    echo "Please set NUM_AGENTS environment variable."
    exit 1
fi

for i in $(seq 0 $(($NUM_AGENTS - 1))); do
    AGENT_PREFIX=$(yq '.bridge.agent_name' bridge_config.yml)
    BRIDGE_ENV_FILE=$AGENT_PREFIX-$i.env
    cat <<EOF >${BRIDGE_ENV_FILE}
POOL_ID=$(yq '.bridge.pool_id' bridge_config.yml)
SITE_NAME=$(yq '.bridge.site_name' bridge_config.yml)
USER_EMAIL=$(yq '.bridge.user_email' bridge_config.yml)
TOKEN_ID=$(yq ".tokens[$i].name" bridge_config.yml)
TOKEN_VALUE=$(yq ".tokens[$i].secret" bridge_config.yml)
TC_SERVER_URL=https://$(yq '.bridge.pod_url' bridge_config.yml)
AGENT_NAME=$AGENT_PREFIX-$i
EOF
    chmod 600 ${BRIDGE_ENV_FILE} # secure that token can't be seen
    docker run --env-file $BRIDGE_ENV_FILE -d --restart=on-failure:1 --name $AGENT_PREFIX-$i bridge_with_drivers
    echo "Started container $AGENT_PREFIX-$i"
done
