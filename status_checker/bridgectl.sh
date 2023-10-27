
# overview:  a bash script for creating bridge on linux docker container.
# here is the documentation: https://help.tableau.com/current/online/en-us/to_bridge_linux_install.htm


# commandline params: --create --start, --stop --config

# --create: creates a bridge-on-linux container

# --start: starts a bridge-on-linux container
   # optional: n for how many container replicas to start

# --stop: stops a bridge-on-linux container
  # optional: n for how many container replicas to stop


# --config parameter points to a yaml file. (see README.md for example contents)

# Examples:
# ./bridgectl.sh --create  ./bridge_config.yaml

# ./bridgectl.sh --stop 3  ./bridge_config.yaml
