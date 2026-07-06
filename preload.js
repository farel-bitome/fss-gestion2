const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isNetworked: () => ipcRenderer.invoke('fss-is-networked'),
  getSharedFolder: () => ipcRenderer.invoke('fss-get-shared-folder'),
  chooseSharedFolder: () => ipcRenderer.invoke('fss-choose-shared-folder'),
  clearSharedFolder: () => ipcRenderer.invoke('fss-clear-shared-folder'),
  loadData: () => ipcRenderer.invoke('fss-load-data'),
  saveData: (jsonStr) => ipcRenderer.invoke('fss-save-data', jsonStr)
});
