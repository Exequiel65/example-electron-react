import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import electronLog from 'electron-log';

// Configurar logger
electronLog.transports.file.level = 'info';
autoUpdater.logger = electronLog;

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Cargar el frontend
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}


function setupAutoUpdater() {

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Exequiel65',
    repo: 'example-electron-react '
  });

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  ipcMain.on('check_for_updates', () => {
    autoUpdater.checkForUpdates()
      .then(result => {
        console.log('Update check result:', result?.updateInfo?.version);
      })
      .catch(err => {
        console.error('Update check error:', err);
        mainWindow?.webContents.send('update_error', err.message);
      });
  });
  
  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update_available', info.version);
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('update_downloaded', info.version);
  });
  
  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('download_progress', {
      percent: progressObj.percent
    });
  });
}

function setupIPC() {
  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('download_update', () => {
    autoUpdater.downloadUpdate();
  });
}

app.whenReady().then(() => {
  const window = createWindow();
  setupAutoUpdater();
  setupIPC();

  // Verificar actualizaciones después de un breve retraso
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 5000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});