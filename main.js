const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 900,
    minHeight: 600,
    title: 'FSS-GESTION',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'FSS-GESTION.html'));

  // Autorise les fenetres d'impression et autres popups ouvertes par l'application
  win.webContents.setWindowOpenHandler(() => ({ action: 'allow' }));
}

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
