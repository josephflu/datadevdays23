#!/bin/bash
set -o errexit; set -o nounset

######
# Loop from 0 to $NUM_AGENTS - 1 and remove the docker container and .env file
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
    AGENT_NAME="${AGENT_PREFIX}-$i"
    BRIDGE_ENV_FILE=$AGENT_NAME.env
    echo "Removing agent $AGENT_NAME"
    rm -f ${BRIDGE_ENV_FILE}
    docker rm -f $AGENT_NAME
    /usr/local/bin/python3.11 ~/_git/dcli/start.py --remove_agent --agent_name $AGENT_NAME
done
