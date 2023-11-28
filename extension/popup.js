document.addEventListener('DOMContentLoaded', async function () {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const containerDiv = document.querySelector('.container')

  if (!tab || !(tab.url.includes('online.tableau.com') || tab.url.includes('online.vnext.tabint.net'))) {
    containerDiv.innerHTML = `<p class="error-no-tableau">Can only run on online.tableau.com</p>`
  } else {
    const poolListBtn = document.querySelector('#pool')
    const poolList = document.querySelector('.pool ul')
    const dbDriversBtn = document.querySelector('#db-drivers')
    const dbDriversList = document.querySelector('.db-drivers ul')
    const txtTokenPrefix = document.querySelector('#prefix')
    const txtTokenNumber = document.querySelector('#number')

    const btn = document.querySelector('#btn-btn')

    const dbDrivers =  ["amazon_athena", "amazon_emr_hadoop_hive", "amazon_redshift", "cloudera_hive", "cloudera_impala",
          "datorama", "dremio", "exasol", "firebolt", "google_bigquery", "ibm_db2", "jaybird", "mapr_drill",
          "mariadb", "microsoft_sharepoint_lists", "microsoft_sql_server", "mysql", "odps", "oracle",
          "oracle_essbase", "oracle_netsuite", "postgresql", "qubole", "salesforce_cdp",
          "salesforce_marketing_cloud", "sap_success_factors", "service_now", "simba_spark", "singlestore",
          "snowflake", "trino", "vertica"]

    let siteId = ''
    let siteName = ''
    let userEmail = ''
    let podUrl = tab.url.split('/')[2]
    let pools = null

    let selectedPool = null
    let selectedDBDrivers = []

    let systemUserId = ''
    let existingPATs = []

    const { cookie, XSRF } = await getCookieAndXSRF(tab)

    // Get session info
    const payload = {
      method: 'getSessionInfo',
      params: {},
    }

    const res1 = await fetch(`https://${podUrl}/vizportal/api/web/v1/getSessionInfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Xsrf-Token': XSRF,
        Cookie: cookie,
      },
      body: JSON.stringify(payload),
    })

    const data = await res1.json()

    if (!data) {
      showError("Unable To Get SiteName From SessionInfo")
      return;
    }
    clearError()
    siteId = data.result.site.id
    siteName = data.result.site.name
    userEmail = data.result.user.username
    systemUserId = data.result.user.systemUserId

    // Get edge pools
    const res2 = await fetch(`https://${podUrl}/vizportal/api/web/v1/getEdgePools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Xsrf-Token': XSRF,
        Cookie: cookie,
      },
      body: JSON.stringify({method: 'getEdgePools', params: {siteId}})
    })

    let data2 = await res2.json()
    if (data2 && data2.result) {
      pools = data2.result.success && data2.result.success.userDefinedPools ? data2.result.success.userDefinedPools : null
    }

    let PATs = []
    // Show pool list on pool list button click
    poolListBtn.addEventListener('click', async function () {
      const poolListStyles = window.getComputedStyle(poolList)
      const display = poolListStyles.getPropertyValue('display')

      if (display === 'block') {
        poolList.style.display = 'none'

        return
      }

      poolList.innerHTML = ''

      if (pools) {
        for (const pool in pools) {
          const li = document.createElement('li')
          li.innerHTML = `<span class="check"></span><span>${pools[pool].displayName}</span>`
          poolList.appendChild(li)
          li.addEventListener('click', function () {
            selectedPool = pools[pool]
            let selectedPoolName = selectedPool.displayName
            let myElement = document.getElementById("Pools");

            myElement.innerHTML = `${selectedPoolName}`;
            poolList.style.display = 'none'
          })
        }
      }
      poolList.style.display = 'block'
    })

    // Show db drivers dropdown on click
    dbDriversBtn.addEventListener('click', async function () {
      const dbDriversListStyles = window.getComputedStyle(dbDriversList)

      const display = dbDriversListStyles.getPropertyValue('display')

      if (display === 'block') {
        dbDriversList.style.display = 'none'
        return
      }

      dbDriversList.innerHTML = ''

      for (const driver of dbDrivers) {
        const li = document.createElement('li')

        li.innerHTML = `<li>
          <span class="check">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-6 h-6"
              style="display: ${selectedDBDrivers.includes(driver) ? 'inline' : 'none'};"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <span>${driver}</span>
        </li>`

        dbDriversList.appendChild(li)

        li.addEventListener('click', function () {
          if (selectedDBDrivers.includes(driver)) {
            selectedDBDrivers = selectedDBDrivers.filter((d) => d !== driver)
            li.querySelector('.check svg').style.display = 'none'

            if (selectedDBDrivers.length === 0) {
              dbDriversBtn.innerHTML = `
            <span>Select DB Drivers</span>
            <span class="chevron-down">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
            `
            } else {
              dbDriversBtn.innerHTML = `
              <span>${selectedDBDrivers.join(', ')}</span>
              <span class="chevron-down">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
              `
            }
            return
          }

          selectedDBDrivers.push(driver)
          li.querySelector('.check svg').style.display = 'inline'

          dbDriversBtn.innerHTML = `
          <span>${selectedDBDrivers.join(', ')}</span>
          <span class="chevron-down">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
          `
        })
      }

      dbDriversList.style.display = 'block'
    })

    // Generate PATs+metadata and download yaml file
    btn.addEventListener('click', async function () {
      try
      {
        btn.disabled = true

        let loopStartAt = 0

        const { cookie, XSRF } = await getCookieAndXSRF(tab)
        if (!selectedPool){
          showError('Please Select A Pool')
          return;
        }
        if (selectedDBDrivers.length === 0) {
          showError('Please Select Database Driver(s)');
          return;
        }
        if (txtTokenPrefix.value === "") {
          showError('Please enter a token prefix');
          return;
        }

        const numTokenInt = parseInt(txtTokenNumber.value, 10);
        if (!(!isNaN(numTokenInt) && numTokenInt >= 1 && numTokenInt <= 30)) {
          showError('Please enter a number of tokens 1-30');
          return;
        }
        // Get existing PATs
        const res = await fetch(
          `https://${podUrl}/vizportal/api/web/v1/getPersonalAccessTokenNames`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Xsrf-Token': XSRF,
              Cookie: cookie,
            },
            body: JSON.stringify({method: 'getPersonalAccessTokenNames', params: {userId: systemUserId}}),
          }
        )

        const data = await res.json()
        if (data && data.result && data.result.tokenInfos) {
          existingPATs = data.result.tokenInfos
        }
        var tokenPrefix = txtTokenPrefix.value + '-'
        if (existingPATs.length) {
          for (const pat of existingPATs) {
            if (pat.clientId.startsWith(tokenPrefix)) {
              showError('Token already exists with prefix ' + tokenPrefix);
              return;
              // let nameParts = pat.clientId.split('-')
              // let lastSegment = nameParts[nameParts.length - 1]
              // let num = parseInt(lastSegment)
              // if (num >= loopStartAt) loopStartAt = num + 1
            }
          }
        }
        var loopEndAt = loopStartAt + numTokenInt // make n pat tokens named '{tokenPrefix}-{n}'
        for (let i = loopStartAt; i < loopEndAt; i++) {
          const res = await fetch(
            `https://${podUrl}/vizportal/api/web/v1/createPersonalAccessToken`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Xsrf-Token': XSRF,
                Cookie: cookie,
              },
              body: JSON.stringify({method: 'createPersonalAccessToken', params: {clientId: tokenPrefix + i}})
            }
          )

          const data = await res.json()
          if (!data || ! data.result.refreshToken){
            showError("Unable To Create PAT Token")
            return;
          }
          clearError()
          PATs.push({
            name: tokenPrefix + i,
            secret: data.result.refreshToken,
          })
        }

        // Create a yaml file with PATs to download
        const yaml = jsyaml.dump({
          tokens: PATs,
          bridge: {
            pool_name: selectedPool.displayName,
            pool_id: selectedPool.id,
            user_email: userEmail,
            pod_url: podUrl,
            site_name: siteName,
            agent_name: txtTokenPrefix.value,
            db_drivers: selectedDBDrivers,
          },
        })

        const element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(yaml))
        element.setAttribute('download', 'tableau_managed_bridge_onboarding.yaml')

        element.style.display = 'none'
        document.body.appendChild(element)

        element.click()

        document.body.removeChild(element)

        selectedPool = null
        let myElement = document.getElementById("Pools");
        myElement.innerHTML = `Select a Pool`;
        selectedDBDrivers = []

        dbDriversBtn.innerHTML = `
        <span>Select DB Drivers</span>
        <span class="chevron-down">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
        `
      }
      finally{
        btn.disabled = false
      }
    })
  }
})

const checkCookie = (url) => {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll(
      {
        url: url,
      },
      function (cookies) {
        if (cookies) {
          resolve(cookies)
        } else {
          reject(false)
        }
      }
    )
  })
}

const getCookieAndXSRF = async (tab) => {
  let cookie = ''
  let XSRF = ''

  const cookies = await checkCookie(tab.url)

  if (cookies) {
    cookies.forEach((c) => {
      if (c.name === 'XSRF-TOKEN') {
        XSRF = c.value
      }

      cookie += c.name + '=' + c.value + ';'
    })
  }

  return { cookie, XSRF }
}

function showError(message) {
  let errorContainer = document.getElementById('errorContainer');

  // Clear any existing error messages
  errorContainer.innerHTML = '';
  let errorBox = document.createElement('div');
  errorBox.textContent = `⚠️    ${message}`;

  // Error box styling
  errorBox.style.backgroundColor = '#fdf9f0';
  errorBox.style.color = 'black';
  errorBox.style.padding = '10px';
  errorBox.style.marginTop = '10px';
  errorBox.style.borderRadius = '5px';

  errorContainer.appendChild(errorBox);
}

function clearError() {
  let errorContainer = document.getElementById('errorContainer');
  errorContainer.innerHTML = '';
  let errorBox = document.createElement('div');
  errorContainer.appendChild(errorBox);
}
