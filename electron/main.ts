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
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js') // Necesario para comunicación IPC segura
    },
  });

  // Cargar el frontend
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Configurar manejadores de eventos de la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Verificar actualizaciones después de que la ventana esté lista
  mainWindow.webContents.on('did-finish-load', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// Configurar autoUpdater
function setupAutoUpdater() {
  autoUpdater.autoDownload = false; // Opcional: control manual de descarga

  // Eventos de actualización
  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update_downloaded');
  });

  autoUpdater.on('error', (error) => {
    mainWindow?.webContents.send('update_error', error.message);
  });
}

// Manejar comandos IPC desde el renderer
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('download_update', () => {
  autoUpdater.downloadUpdate();
});

// Iniciar la aplicación
app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
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