const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('backend', {
  startTraining: (config) => ipcRenderer.send('start-training', config),
  stopTraining: () => ipcRenderer.send('stop-training'),
  onLog: (callback) => ipcRenderer.on('training-log', (_event, data) => callback(data)),
});
