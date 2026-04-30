const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('habitAPI', {
  // Database
  readDB: () => ipcRenderer.invoke('db:read'),
  writeDB: (data) => ipcRenderer.invoke('db:write', data),

  // Notifications
  notify: (title, body) => ipcRenderer.invoke('notify', { title, body }),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Platform info
  platform: process.platform,
});
