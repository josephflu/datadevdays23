
## Automation for Tableau Bridge on Linux Docker Containers

## Author
Joseph Fluckiger @josephflu on twitter and linkedin <br>
Presented at Tableau Data Dev Days Nov, 2nd 2023 <br>
https://www.tableau.com/learn/webinars/datadev-day-2023-11-02

## Disclaimer
This repo contains source code and example files for creating Tableau bridge Linux containers.
These scripts may be useful but are unsupported. Please get help from other users on the Tableau Community Forums.

## High-Level Steps
1. Collect the required information: tableau cloud site_name, pool_id, PAT token
2. Download Bridge Linux .rpm installer file
3. Download Database drivers
4. Create a Bridge container image
5. Run the Bridge container


## Prerequisites
1. Docker
2. Bash shell (On Mac and Linux it is included and on Windows, you can install Windows Subsystem for Linux)
3. For Database Drivers, you'll need a bash script to download and install them in the container.


## Files in this repo
1. Dockerfile - Dockerfile for creating Tableau Bridge Linux container
2. bridge_config.yml - yaml file for storing Tableau Bridge information
3. build_bridge_on_linux_image.sh - bash script for executing docker build to create a container image
4. run-bridge.sh - bash script for executing docker run to run a container
