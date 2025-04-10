const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Sistema de actualizaciones
  checkForUpdates: () => ipcRenderer.send('check_for_updates'),
  
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update_available', (_, version) => callback(version));
  },
  
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update_downloaded', (_, version) => callback(version));
  },
  
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download_progress', (_, progressObj) => {
      callback(Math.round(progressObj.percent));
    });
  },
  
  downloadUpdate: () => ipcRenderer.send('download_update'),
  restartApp: () => ipcRenderer.send('restart_app'),
  
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('update_available');
    ipcRenderer.removeAllListeners('update_downloaded');
    ipcRenderer.removeAllListeners('download_progress');
  }
});