import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  files: {
    openFile: () => ipcRenderer.invoke('files:openFile'),
    saveFile: (filePath: string, content: string) => ipcRenderer.invoke('files:saveFile', filePath, content),
  },
  aws: {
    hasAWSConfiguration: () => ipcRenderer.invoke('aws:hasAWSConfiguration'),
    readAWSConfiguration: () => ipcRenderer.invoke('aws:readAWSConfiguration'),
    ssm: {
      listParameters: (region: string, profile: string) => ipcRenderer.invoke('aws:ssm:listParameters', region, profile),
      getParameter: (region: string, profile: string, name: string) => ipcRenderer.invoke('aws:ssm:getParameter', region, profile, name),
      putParameter: (region: string, profile: string, name: string, value: string, type: string) => ipcRenderer.invoke('aws:ssm:putParameter', region, profile, name, value, type),
      deleteParameter: (region: string, profile: string, name: string) => ipcRenderer.invoke('aws:ssm:deleteParameter', region, profile, name),
      getCategorizations: () => ipcRenderer.invoke('aws:ssm:getCategorizations'),
      saveCategorization: (patterns: string[]) => ipcRenderer.invoke('aws:ssm:saveCategorization', patterns),
    }
  },
  ai: {
    readConfiguration: () => ipcRenderer.invoke('ai:readConfiguration'),
    saveConfiguration: (config: any) => ipcRenderer.invoke('ai:saveConfiguration', config),
    getModels: (profileId: string) => ipcRenderer.invoke('ai:getModels', profileId),
    prompt: (profileId: string, model: string, input: string) => ipcRenderer.invoke('ai:prompt', profileId, model, input),
  }
});
