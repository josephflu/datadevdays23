import json
from http.client import responses

from dataclasses import dataclass
import requests
from typing import List
from src.models import PatToken

api_version = "3.19"

@dataclass
class LoginResult:
    is_success: bool = None
    status_code: int = None
    status_text: str = None
    site_id: str = None
    session_token: str = None
    user_id: str = None
    tc_pod_url: str = None
    error: str = ""

@dataclass
class JobsResult:
    jobs: dict

class TableauCloudLogin:
    @staticmethod
    def login(pat: PatToken, raise_if_not_success: bool = False) -> LoginResult:
        body = {
            "credentials": {
                "personalAccessTokenName": pat.name,  # note this field is not really used, so can be anything.
                "personalAccessTokenSecret": pat.secret,
                "site": {
                    "contentUrl": pat.sitename
                }
            }
        }
        headers = {
            'accept': 'application/json',
        }
        r = requests.post(f"{pat.pod_url}/api/{api_version}/auth/signin", json=body, headers=headers)
        status_text = f"{responses[r.status_code]}"
        result = LoginResult()
        result.is_success = r.status_code == 200
        result.status_code = r.status_code
        result.status_text = status_text
        result.tc_pod_url = pat.pod_url
        if result.is_success:
            response = json.loads(r.content)
            result.session_token = response["credentials"]["token"]
            result.site_id = response["credentials"]["site"]["id"]
            result.user_id = response["credentials"]["user"]["id"]
        else:
            result.error = result.status_text
            if raise_if_not_success:
                raise Exception(f"unable to login with pat token {pat.name}. status_text: {result.status_text}")
        return result

    @staticmethod
    def logout(pod_url: str, session_token: str):
        if not pod_url or not session_token:
            return
        headers = {
            'accept': 'application/json',
            'X-tableau-auth': session_token
        }
        res_signout = requests.post(f"{pod_url}/api/{api_version}/auth/signout", headers=headers)
        res_signout.raise_for_status()

    @staticmethod
    def is_token_valid(pat: PatToken) -> LoginResult:
        r=TableauCloudLogin.login(pat)
        if r.is_success:
            TableauCloudLogin.logout(pat.pod_url, r.session_token)
        return r

class TCApiClient:
    _headers = {'Accept': 'application/json',
                'Content-Type': 'application/json'}
    xsrf_value = "9f3WV3ekuJmVEA" # this can be any string, it is used by the server to prevent cross-site scripting attacks.

    def __init__(self, login_result: LoginResult):
        self.session_token = login_result.session_token
        self.tc_pod_url = login_result.tc_pod_url
        self.site_luid = login_result.site_id

    def get_cookie_headers(self):
        return {**self._headers, **{
            "X-Xsrf-Token": self.xsrf_value,
            "Cookie": f"workgroup_session_id={self.session_token}; XSRF-TOKEN={self.xsrf_value}"
        }}

    def _post_private(self, url_part: str, body: dict):
        r = requests.post(f"{self.tc_pod_url}{url_part}", headers=self.get_cookie_headers(), json=body)
        r.raise_for_status()
        return json.loads(r.content)

    def _post_xml(self, url_part: str, xml_data: str):
        xml_headers = {'Accept': 'application/json',
                       'Content-Type': 'application/xml',
                       'X-Tableau-Auth': self.session_token,
        }
        r = requests.post(f"{self.tc_pod_url}{url_part}", headers=xml_headers, data=xml_data)
        r.raise_for_status()
        return json.loads(r.content)

    def _get(self, url_part: str):
        get_headers = {'Accept': 'application/json',
                       'X-Tableau-Auth': self.session_token,
        }
        r = requests.get(f"{self.tc_pod_url}{url_part}", headers=get_headers)
        r.raise_for_status()
        return json.loads(r.content)

    def _delete(self, url_part: str):
        headers = {'Accept': 'application/json',
                       'X-Tableau-Auth': self.session_token,
                   }
        r = requests.delete(f"{self.tc_pod_url}{url_part}", headers=headers)
        r.raise_for_status()

    def logout(self):
        TableauCloudLogin.logout(self.tc_pod_url, self.session_token)

    def get_bridge_settings(self, site_id: str):
        body = {
            "method": "getSiteBridgeSettingsForSiteAdmin",
            "params": {
                "id": site_id
            }
        }
        return self._post_private("/vizportal/api/web/v1/getSiteBridgeSettingsForSiteAdmin", body)

    def get_agent_connection_status(self):
        body = {
            "method": "getSiteRemoteAgentsConnectionStatus",
            "params": {}}
        return self._post_private("/vizportal/api/web/v1/getSiteRemoteAgentsConnectionStatus", body)

    def get_edge_pools(self, site_id: str):
        body = {
            "method": "getEdgePools",
            "params": {
                "siteId": site_id
            }
        }
        return self._post_private("/vizportal/api/web/v1/getEdgePools", body)

    def create_edge_pool(self, pool_name: List[str], site_id: str):
        body = {"method": "createEdgePool",
                    "params": {
                      "displayName": pool_name,
                      "siteId": site_id,
                      "bridgeSettingsVersion": "0"
                    }
                }
        return self._post_private("/vizportal/api/web/v1/createEdgePool", body)

    def delete_edge_pools(self, pool_ids: List[str], site_id: str):
        body = {"method": "deleteEdgePools",
                    "params": {
                      "poolIds": pool_ids,
                      "siteId": site_id,
                      "bridgeSettingsVersion": "0"
                    }
                }
        return self._post_private("/vizportal/api/web/v1/deleteEdgePools", body)

    def update_agent_pool(self, pool_id: str, site_id: str, agent_id: str):
        """ Update the agent pool, or set an agent to Unassigned """
        body = {"method": "updateEdgePool",
                "params": {
                    "poolId": pool_id,
                    "agentChange": {"agentId": agent_id},
                    "siteId": site_id,
                    "bridgeSettingsVersion": "0"
                    }
                }
        return self._post_private("/vizportal/api/web/v1/updateEdgePool", body)

    def delete_bridge_agent(self, owner_id: str, device_id: str):
        body = {"method": "deleteUserRemoteAgents",
                "params": {
                    "ownerId": owner_id,
                    "deviceIds": [device_id]
                }}
        return self._post_private("/vizportal/api/web/v1/deleteUserRemoteAgents", body)

    def get_personal_access_token_names(self, user_id: str):
        body = {
            "method": "getPersonalAccessTokenNames",
            "params": {
                "userId": user_id
            }
        }
        return self._post_private("/vizportal/api/web/v1/getPersonalAccessTokenNames", body)

    def revoke_personal_access_token(self, user_id: str, token_name: str):
        body = {
            "method": "revokePersonalAccessTokenByName",
            "params": {
                "userId": user_id,
                "tokenName": token_name
            }
        }
        return self._post_private("/vizportal/api/web/v1/revokePersonalAccessTokenByName", body)

    def get_session_info(self):
        body = {
            "method": "getSessionInfo",
            "params": {}
        }
        return self._post_private(f'/vizportal/api/web/v1/getSessionInfo', body)

    def refresh_session(self):
        body = {
                "method": "refreshSession",
                "params": {}
                }
        return self._post_private("/vizportal/api/web/v1/refreshSession", body)

    def get_server_info(self):
        headers = {**self._headers, **{
            "X-Tableau-Auth": self.session_token,
        }}
        url = f"/api/{api_version}/serverinfo"
        r = requests.get(f"{self.tc_pod_url}{url}", headers=headers)
        r.raise_for_status()
        return json.loads(r.content)

    def get_jobs(self) -> JobsResult:
        headers = {**self._headers, **{
            'X-Tableau-Auth': self.session_token
        }}
        r = requests.get(f"{self.tc_pod_url}/api/{api_version}/sites/{self.site_luid}/jobs", headers=headers)
        status_text = f"{responses[r.status_code]}"
        if r.status_code != 200:
            raise Exception(f"unable to get jobs. {status_text}, {r.content}")

        response = json.loads(r.content)
        jobs = JobsResult(response)
        return jobs

class TCApiLogic:
    def __init__(self, api_client: TCApiClient):
        self.api = api_client

    def get_pools_for_site(self, site_id):
        pass

    def get_bridge_status(self, site_id):
        status_ret = self.api.get_agent_connection_status()
        status = {}
        for b in status_ret["result"]["agents"]:
            status[b["agentName"]] = b["connectionStatus"]

        pools_ret = self.api.get_edge_pools(site_id)
        agents = []
        s = pools_ret["result"]["success"]
        up: dict = s["userDefinedPools"]
        for k, pool in up.items():
            for kp, agent in pool["agents"].items():
                agent["poolName"] = pool["displayName"]
                agents.append(agent)
        for k, v in s["defaultPoolAgents"].items():
            v["poolName"] = "(default)"
            agents.append(v)
        for k, v in s["unassignedAgents"].items():
            v["poolName"] = "(unassigned)"
            agents.append(v)

        rows = []
        for b in agents:
            last_local = b["lastUsed"]  # StringUtils().convert_utc_to_local(b["lastUsed"])
            rows.append(
                [b["agentName"], status.get(b["agentName"]), b["poolName"], b["version"], b["ownerFriendlyName"],
                 last_local, b["needsUpgrade"], b["extractRefreshDatasourceCount"]])
        return rows
