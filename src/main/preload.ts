import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  // saveFile is restricted to paths previously authorized via openFile
  saveFile: (filePath: string, content: string) => ipcRenderer.invoke('save-file', filePath, content),
  hasAWSConfiguration: () => ipcRenderer.invoke('has-aws-configuration'),
  readAWSConfiguration: () => ipcRenderer.invoke('read-aws-configuration'),
  awsSSMListParameters: (region: string, profile: string) => ipcRenderer.invoke('aws-ssm-list-parameters', region, profile),
  awsSSMGetParameter: (region: string, profile: string, name: string) => ipcRenderer.invoke('aws-ssm-get-parameter', region, profile, name),
  awsSSMPutParameter: (region: string, profile: string, name: string, value: string, type: string) => ipcRenderer.invoke('aws-ssm-put-parameter', region, profile, name, value, type),
  awsSSMDeleteParameter: (region: string, profile: string, name: string) => ipcRenderer.invoke('aws-ssm-delete-parameter', region, profile, name),
  getSSMCategorizations: () => ipcRenderer.invoke('get-ssm-categorizations'),
  saveSSMCategorization: (patterns: string[]) => ipcRenderer.invoke('save-ssm-categorization', patterns),
});
