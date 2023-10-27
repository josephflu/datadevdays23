#!/usr/bin/env bash
set -o errexit

BRIDGE_RPM_URL=https://github.com/tableau/bridge_pre/releases/download/v0.1.3/tableau-bridge-tableau-2023-3-dev.23.0804.1505.x86_64.rpm

mkdir -p bridge_rpm
pushd bridge_rpm
curl -OL ${BRIDGE_RPM_URL}
popd

export DOCKER_BUILDKIT=1
docker build -t bridge_with_drivers .
