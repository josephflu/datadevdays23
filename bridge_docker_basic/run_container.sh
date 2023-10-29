#!/bin/bash
export TOKEN_SECRET="<...>"

docker run -d  --name "<bridge-container-name>" \
  -e AGENT_NAME="<bridge-agent-name>" \
  -e TC_SERVER_URL="<https://prod-useast-a.online.tableau.com>" \
  -e SITE_NAME="<sitename>" \
  -e USER_EMAIL="<user@company.com>" \
  -e TOKEN_ID="<token-id>" \
  -e TOKEN_VALUE="${TOKEN_SECRET}" \
  -e POOL_ID="<e0739483-689f-400c-9925-e8a0f11424b3>" \
  bridge_basic

