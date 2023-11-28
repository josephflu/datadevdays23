
# script to call tableau cloud APIS and display a recent jobs report.

source ~/.zshrc

agent_name="$1"
if [[ -z "$agent_name" ]]; then
  echo "Usage: $0 AGENT_NAME"
  exit 1
fi

echo "removing $agent_name from tableau cloud api"
dcli --remove_agent --agent_name $agent_name

echo "removing local agent container $agent_name"
docker rm -f $agent_name
