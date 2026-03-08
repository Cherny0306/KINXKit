const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  detectEnv: () => ipcRenderer.invoke('env:detect'),
  createProject: (payload) => ipcRenderer.invoke('project:create', payload),
  dockerUp: (payload) => ipcRenderer.invoke('docker:up', payload),
  dockerDown: (payload) => ipcRenderer.invoke('docker:down', payload),
  dockerStatus: (payload) => ipcRenderer.invoke('docker:status', payload),
  diagnose: () => ipcRenderer.invoke('fix:diagnose'),
  applyAiPreset: (payload) => ipcRenderer.invoke('preset:ai', payload),
  githubCreate: (payload) => ipcRenderer.invoke('github:create', payload),
  chooseDir: () => ipcRenderer.invoke('dialog:chooseDir'),
  saveJson: (payload) => ipcRenderer.invoke('file:saveJson', payload),
  setLogDir: (payload) => ipcRenderer.invoke('log:setDir', payload),
  writeLog: (payload) => ipcRenderer.invoke('log:write', payload)
});
