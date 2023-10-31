# Tableau Managed Bridge Onboarding Chrome Extension
#### 1. Download the latest dc-admin

```
  git clone https://github.com/Distributed-Cloud-emu/dc-admin
```

#### 2. Navigate to Google Chrome's Extensions

```
  chrome://extensions/
```
#### 3. Enable Developer Mode on the top right and press the "Load unpacked" button on the Chrome Extenstion Page

<img src="assets/LoadUnpacked.png" alt="Show Load unpacked button In Top Left" width="75%" height="75%">

#### 4. Select this folder within the dc-admin folder which contains the extension. 

```
  src/chrome_ext
```

#### 5. From the Chrome Extensions Menu, right click and pin the extension 
<img src="assets/manage_extensions_pin.png" alt="Pin extension" width="400">

#### 6. Login to https://online.tableau.com


#### 7. Open the extension, select a pool and a set of DB drivers, and press the Generate button

Note that a yaml file containing the newly created PAT tokens and other metadata needed to onboard a new 
managed bridge bridge agents.

<img src="assets/Demo.png" alt="Show Demo" width="471">
