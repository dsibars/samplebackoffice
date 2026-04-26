import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import squirrelStartup from 'electron-squirrel-startup';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as ini from 'ini';
import { SSMClient, DescribeParametersCommand, GetParameterCommand } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';

const authorizedPaths = new Set<string>();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the React app.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
};

app.whenReady().then(() => {
  ipcMain.handle('open-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Data Files', extensions: ['json', 'csv'] }]
    });
    if (canceled || filePaths.length === 0) {
      return null;
    }
    const filePath = filePaths[0];
    authorizedPaths.add(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    return { filePath, content, fileName: basename(filePath) };
  });

  ipcMain.handle('save-file', async (_event, filePath: string, content: string) => {
    if (!authorizedPaths.has(filePath)) {
      console.error(`Security Warning: Unauthorized attempt to write to ${filePath}`);
      throw new Error('Unauthorized file access: The specified path has not been opened for editing.');
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  });

  ipcMain.handle('has-aws-configuration', async () => {
    const awsPath = path.join(os.homedir(), '.aws', 'credentials');
    return fs.existsSync(awsPath);
  });

  ipcMain.handle('aws-ssm-list-parameters', async (_event, region: string, profile: string) => {
    const client = new SSMClient({
      region,
      credentials: fromIni({ profile })
    });
    const command = new DescribeParametersCommand({});
    const response = await client.send(command);
    return response.Parameters || [];
  });

  ipcMain.handle('aws-ssm-get-parameter', async (_event, region: string, profile: string, name: string) => {
    const client = new SSMClient({
      region,
      credentials: fromIni({ profile })
    });
    const command = new GetParameterCommand({ Name: name, WithDecryption: true });
    const response = await client.send(command);
    return response.Parameter;
  });

  ipcMain.handle('read-aws-configuration', async () => {
    const awsPath = path.join(os.homedir(), '.aws', 'credentials');
    const configPath = path.join(os.homedir(), '.aws', 'config');

    let profiles: any[] = [];

    if (fs.existsSync(awsPath)) {
      const credentialsContent = fs.readFileSync(awsPath, 'utf-8');
      const credentials = ini.parse(credentialsContent);

      for (const profileName in credentials) {
        profiles.push({
          name: profileName,
          accessKeyId: credentials[profileName].aws_access_key_id,
        });
      }
    }

    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const config = ini.parse(configContent);

      for (const section in config) {
        let profileName = section;
        if (section.startsWith('profile ')) {
          profileName = section.replace('profile ', '');
        }

        const existingProfile = profiles.find(p => p.name === profileName);
        if (existingProfile) {
          existingProfile.region = config[section].region;
        } else {
          profiles.push({
            name: profileName,
            region: config[section].region,
          });
        }
      }
    }

    return { profiles };
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
