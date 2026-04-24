import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import squirrelStartup from 'electron-squirrel-startup';
import * as fs from 'node:fs';

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
