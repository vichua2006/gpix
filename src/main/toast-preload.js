const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script for toast notifications
 */
contextBridge.exposeInMainWorld('toastAPI', {
  onToastData: (callback) => {
    ipcRenderer.on('toast-data', (event, data) => callback(data));
  },
  onHide: (callback) => {
    ipcRenderer.on('toast-hide', () => callback());
  }
});
