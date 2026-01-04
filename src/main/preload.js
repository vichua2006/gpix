const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script to expose safe IPC methods to renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Get DPI scale factor from main process
  getScaleFactor: () => ipcRenderer.invoke('get-scale-factor'),
  
  // Receive screenshot data from main process
  onScreenshotData: (callback) => {
    ipcRenderer.on('screenshot-data', (event, data) => callback(data));
  },
  
  // Send selection complete event
  sendSelectionComplete: (rect) => {
    ipcRenderer.send('selection-complete', rect);
  },
  
  // Send selection cancelled event
  sendSelectionCancelled: () => {
    ipcRenderer.send('selection-cancelled');
  }
});

