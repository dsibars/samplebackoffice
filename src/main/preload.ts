import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  // saveFile is restricted to paths previously authorized via openFile
  saveFile: (filePath: string, content: string) => ipcRenderer.invoke('save-file', filePath, content),
  hasAWSConfiguration: () => ipcRenderer.invoke('has-aws-configuration'),
  readAWSConfiguration: () => ipcRenderer.invoke('read-aws-configuration'),
  awsSSMListParameters: (region: string) => ipcRenderer.invoke('aws-ssm-list-parameters', region),
  awsSSMGetParameter: (region: string, name: string) => ipcRenderer.invoke('aws-ssm-get-parameter', region, name),
});
