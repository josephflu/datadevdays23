#!/usr/bin/env bash
set -o errexit

# STEP - read drivers to install list from bridge_config.yml
if [[ ! -f bridge_config.yml ]]; then
  echo "Config file bridge_config.yml is absent, please rename bridge_config.example.yml and populate from your Tableau Site"
  exit 1
fi

DRIVERS=$(yq '.bridge.db_drivers | join(",")' bridge_config.yml)
export DRIVERS

# STEP - Download tableau bridge rpm
BRIDGE_RPM_URL=https://github.com/tableau/bridge_pre/releases/download/v0.1.3/tableau-bridge-tableau-2023-3-dev.23.0804.1505.x86_64.rpm
mkdir -p bridge_rpm
pushd bridge_rpm
curl -OL ${BRIDGE_RPM_URL}
popd

# STEP - Start container image build
export DOCKER_BUILDKIT=1
docker build --no-cache --build-arg DRIVERS -t bridge_with_drivers .

