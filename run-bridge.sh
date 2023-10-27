#!/bin/bash
set -e -x

if [[ -z $NUM_AGENTS ]]; then
    echo "Please set NUM_AGENTS environment variable."
    exit 1
fi

for i in $(seq 1 $NUM_AGENTS); do
    docker run -d bridge_with_drivers
    echo "Started container $i"
done


#docker run --restart=on-failure:0 --name "bridge_fluke23_dcudev_jfmac1_008" \
#  -e AGENT_NAME="jfluckiger-ltm_dcudev_jfmac1_008" \
#  -e TC_URL="https://prod-useast-a.online.tableau.com" \
#  -e SITE_NAME="fluke23" -e USER_EMAIL="jfluckiger@tableau.com" \
#  -e TOKEN_ID="dcudev_jfmac1_008" -e TOKEN_VALUE="..." \
#  -e POOL_ID="469a6562-c62c-4b13-b6b2-4441e2057366" -d bridge_dc
