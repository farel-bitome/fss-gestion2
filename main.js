const { app, BrowserWindow, session, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(app.getPath('userData'), 'network-config.json');
const DATA_FILENAME = 'fss-gestion-data.json';

function getNetworkConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const cfg = JSON.parse(raw);
    return { sharedFolder: (cfg.sharedFolder || '').trim() };
  } catch (e) {
    return { sharedFolder: '' };
  }
}

function setNetworkConfig(sharedFolder) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ sharedFolder: (sharedFolder || '').trim() }), 'utf8');
}

function dataFilePath() {
  const cfg = getNetworkConfig();
  if (!cfg.sharedFolder) return null;
  return path.join(cfg.sharedFolder, DATA_FILENAME);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 900,
    minHeight: 600,
    title: 'FSS-GESTION',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'FSS-GESTION.html'));

  // Autorise les fenetres d'impression et autres popups ouvertes par l'application
  win.webContents.setWindowOpenHandler(() => ({ action: 'allow' }));
}

ipcMain.handle('fss-is-networked', () => {
  return !!getNetworkConfig().sharedFolder;
});

ipcMain.handle('fss-get-shared-folder', () => {
  return getNetworkConfig().sharedFolder;
});

ipcMain.handle('fss-choose-shared-folder', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Choisir ou creer le dossier reseau partage',
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || !result.filePaths[0]) return null;
  setNetworkConfig(result.filePaths[0]);
  return result.filePaths[0];
});

ipcMain.handle('fss-clear-shared-folder', () => {
  setNetworkConfig('');
  return true;
});

ipcMain.handle('fss-load-data', () => {
  const file = dataFilePath();
  if (!file) return null;
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    return null; // fichier pas encore cree, ou dossier inaccessible
  }
});

ipcMain.handle('fss-save-data', (event, jsonStr) => {
  const file = dataFilePath();
  if (!file) return false;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    // ecriture atomique : on ecrit dans un fichier temporaire puis on renomme
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, jsonStr, 'utf8');
    fs.renameSync(tmp, file);
    return true;
  } catch (e) {
    return false;
  }
});

app.whenReady().then(() => {
  // Autorise l'acces camera (necessaire pour la prise de photo directe)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
