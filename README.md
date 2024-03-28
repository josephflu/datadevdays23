
### Automation for Tableau Bridge on Linux Docker Containers

### Author
Joseph Fluckiger @josephflu on twitter and linkedin <br>
Presented at Tableau Data Dev Days Nov, 2nd 2023 <br>
https://www.tableau.com/learn/webinars/datadev-day-2023-11-02



### Updated Content
# Note, for updated content please see this new repository: https://github.com/tableau/bridgectl



### Terms of Use
This repo contains source code and example files for creating Tableau bridge Linux containers.
These scripts may be useful but are unsupported. Please get help from other users on the Tableau Community Forums.

### High-Level Steps
1. Collect the required information: tableau cloud site_name, pool_id, PAT token
2. Download Bridge Linux .rpm installer file
3. Download Database drivers
4. Create a Bridge container image
5. Run the Bridge container


### Prerequisites
1. Docker
2. Bash shell
3. For Database Drivers, you'll need a bash script to download and install them in the container.


### Project Contents:
#### /build_docker_basic
Basic example of building a Tableau Bridge Linux container image and running a container.
1. download.sh - bash script to download Tableau Bridge Linux .rpm installer file and database drivers.
2. Dockerfile - Definition for creating Tableau Bridge Linux container.
3. start-bridgeclient.sh - script copied into container and used to start the bridge client when the container starts.
4. build_image.sh - bash script for executing docker build to create a container image.
5. run_container.sh - bash script for executing docker run to run a container.

#### /build_docker_automation
More advanced example of building a Tableau Bridge Linux container image.
1. bridge_config.example.yml - example bridge on linux configuration (rename to bridge_config.yml and populate with your tableau site information)
2. Dockerfile - Definition for creating Tableau Bridge Linux container.
3. build_bridge_docker_image.sh - bash script for executing docker build to create a container image.
4. run-bridge.sh - bash script for executing docker run to run a container.
5. start-bridgeclient.sh - script copied into container and used to start the bridge client when the container starts.

#### /extension
This Google Chrome extension makes it easy to collect the settings as a yaml file needed to run Tableau Bridge on Linux containers. It allows the user to select the Pool, DB drivers, number of tokens to create, and Bridge agent name which is then downloaded as a yaml file to be used in automation scripts for creating and running Bridge on Linux containers. It also creates a number of PAT tokens, one for each bridge agent.

#### /scripts
1. bridge_status.zsh - Call Tableau Cloud APIS to get status of bridge clients.
2. jobs_report.zsh - Call Tableau Cloud APIS to get jobs report.


### Documentation for Tableau Bridge
See official Tableau documentation for creating bridge containers on Linux
https://help.tableau.com/current/online/en-us/to_bridge_linux_install.htm

