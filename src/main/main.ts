import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import squirrelStartup from 'electron-squirrel-startup';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as ini from 'ini';
import { SSMClient, DescribeParametersCommand, GetParameterCommand, PutParameterCommand, DeleteParameterCommand, ParameterMetadata, Parameter, ParameterType } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';
import { AIConfiguration } from '../shared/domain/ai/AIProfile.js';
import { AIService } from '../shared/application/AIService.js';

const authorizedPaths = new Set<string>();

const MOCK_PROFILE = 'mock';

const INITIAL_MOCK_DATA: Parameter[] = [
  { Name: '/dev/config/accounts/db.host', Type: 'String', Value: 'dev-db.internal', LastModifiedDate: new Date() },
  { Name: '/dev/config/accounts/db.password', Type: 'SecureString', Value: 'd3vP@ssw0rd', LastModifiedDate: new Date() },
  { Name: '/live/config/auth/jwt.secret', Type: 'SecureString', Value: 'secret-token-123', LastModifiedDate: new Date() },
  { Name: '/live/config/infra/ee6798/some.property', Type: 'String', Value: 'infra-value', LastModifiedDate: new Date() },
  { Name: '/dev/config/inventory/api.url', Type: 'String', Value: 'https://api-dev.inventory.com', LastModifiedDate: new Date() },
  { Name: '/live/config/shipping/regions', Type: 'StringList', Value: 'us-east-1,eu-west-1,ap-southeast-1', LastModifiedDate: new Date() },
  { Name: '/unmatched/global/parameter', Type: 'String', Value: 'global-value', LastModifiedDate: new Date() },
  { Name: '/test/config/infra/xyz123/logs.level', Type: 'String', Value: 'debug', LastModifiedDate: new Date() },
  { Name: '/prod/config/payment/api.key', Type: 'SecureString', Value: 'prod-key', LastModifiedDate: new Date() },
];

const INITIAL_CATEGORIZATIONS = [
  '/{env}/config/infra/{container}/',
  '/{env}/config/{service}/'
];

function getSSMCategorizations(): string[] {
  const catsPath = path.join(app.getPath('userData'), 'mock-ssm-categorizations.json');
  if (!fs.existsSync(catsPath)) {
    fs.writeFileSync(catsPath, JSON.stringify(INITIAL_CATEGORIZATIONS, null, 2));
    return INITIAL_CATEGORIZATIONS;
  }
  try {
    return JSON.parse(fs.readFileSync(catsPath, 'utf-8'));
  } catch (e) {
    return INITIAL_CATEGORIZATIONS;
  }
}

function getMockData(): Parameter[] {
  const mockDbPath = path.join(app.getPath('userData'), 'mock-aws-ssm.json');
  if (!fs.existsSync(mockDbPath)) {
    fs.writeFileSync(mockDbPath, JSON.stringify(INITIAL_MOCK_DATA, null, 2));
    return INITIAL_MOCK_DATA;
  }
  try {
    const data = JSON.parse(fs.readFileSync(mockDbPath, 'utf-8'));
    // Convert date strings back to Date objects
    return data.map((p: any) => ({
      ...p,
      LastModifiedDate: p.LastModifiedDate ? new Date(p.LastModifiedDate) : undefined
    }));
  } catch (e) {
    return INITIAL_MOCK_DATA;
  }
}

function saveMockData(data: Parameter[]) {
  const mockDbPath = path.join(app.getPath('userData'), 'mock-aws-ssm.json');
  fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2));
}

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

function getAIConfigPath() {
  return path.join(os.homedir(), '.samplebackoffice', 'ai_credentials.json');
}

function ensureAIConfigDir() {
  const dir = path.dirname(getAIConfigPath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readAIConfig(): AIConfiguration {
  const configPath = getAIConfigPath();
  if (!fs.existsSync(configPath)) {
    return { profiles: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.error('Error reading AI config:', e);
    return { profiles: [] };
  }
}

function saveAIConfig(config: AIConfiguration) {
  ensureAIConfigDir();
  fs.writeFileSync(getAIConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
}

app.whenReady().then(() => {
  const aiService = new AIService(readAIConfig);

  ipcMain.handle('read-ai-configuration', async () => {
    return readAIConfig();
  });

  ipcMain.handle('save-ai-configuration', async (_event, config: AIConfiguration) => {
    saveAIConfig(config);
    return true;
  });

  ipcMain.handle('ai-get-models', async (_event, profileId: string) => {
    return aiService.getModels(profileId);
  });

  ipcMain.handle('ai-prompt', async (_event, profileId: string, model: string, input: string) => {
    return aiService.prompt(profileId, model, input);
  });

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
    if (profile === MOCK_PROFILE) {
      const mockData = getMockData();
      return mockData.map(p => ({
        Name: p.Name,
        Type: p.Type,
        LastModifiedDate: p.LastModifiedDate
      } as ParameterMetadata));
    }

    const client = new SSMClient({
      region,
      credentials: fromIni({ profile })
    });
    const command = new DescribeParametersCommand({});
    const response = await client.send(command);
    return response.Parameters || [];
  });

  ipcMain.handle('aws-ssm-get-parameter', async (_event, region: string, profile: string, name: string) => {
    if (profile === MOCK_PROFILE) {
      const mockData = getMockData();
      return mockData.find(p => p.Name === name);
    }

    const client = new SSMClient({
      region,
      credentials: fromIni({ profile })
    });
    const command = new GetParameterCommand({ Name: name, WithDecryption: true });
    const response = await client.send(command);
    return response.Parameter;
  });

  ipcMain.handle('aws-ssm-put-parameter', async (_event, region: string, profile: string, name: string, value: string, type: ParameterType) => {
    if (profile === MOCK_PROFILE) {
      const mockData = getMockData();
      const existingIndex = mockData.findIndex(p => p.Name === name);
      const newParam: Parameter = {
        Name: name,
        Value: value,
        Type: type,
        LastModifiedDate: new Date()
      };
      if (existingIndex >= 0) {
        mockData[existingIndex] = newParam;
      } else {
        mockData.push(newParam);
      }
      saveMockData(mockData);
      return true;
    }

    const client = new SSMClient({
      region,
      credentials: fromIni({ profile })
    });
    const command = new PutParameterCommand({
      Name: name,
      Value: value,
      Type: type,
      Overwrite: true
    });
    await client.send(command);
    return true;
  });

  ipcMain.handle('aws-ssm-delete-parameter', async (_event, region: string, profile: string, name: string) => {
    if (profile === MOCK_PROFILE) {
      const mockData = getMockData();
      const newData = mockData.filter(p => p.Name !== name);
      saveMockData(newData);
      return true;
    }

    const client = new SSMClient({
      region,
      credentials: fromIni({ profile })
    });
    const command = new DeleteParameterCommand({ Name: name });
    await client.send(command);
    return true;
  });

  ipcMain.handle('get-ssm-categorizations', async () => {
    return getSSMCategorizations();
  });

  ipcMain.handle('save-ssm-categorization', async (_event, patterns: string[]) => {
    const catsPath = path.join(app.getPath('userData'), 'mock-ssm-categorizations.json');
    fs.writeFileSync(catsPath, JSON.stringify(patterns, null, 2));
    return true;
  });

  ipcMain.handle('read-aws-configuration', async () => {
    const awsPath = path.join(os.homedir(), '.aws', 'credentials');
    const configPath = path.join(os.homedir(), '.aws', 'config');

    let profiles: any[] = [
      { name: MOCK_PROFILE, region: 'local' }
    ];

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
