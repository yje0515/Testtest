const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let trainingProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
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

ipcMain.on('start-training', (event, config) => {
  if (trainingProcess) {
    event.reply('training-log', 'Training already in progress...');
    return;
  }

  const pythonScript = config.scriptPath || path.join(__dirname, 'backend', 'train.py');
  const args = [
    pythonScript,
    '--dataset',
    config.datasetPath || '',
    '--model',
    config.model || 'yolov5s',
    '--epochs',
    config.epochs?.toString() || '50',
    '--patience',
    config.patience?.toString() || '5',
  ];

  trainingProcess = spawn('python', args);

  trainingProcess.stdout.on('data', (data) => {
    mainWindow?.webContents.send('training-log', data.toString());
  });

  trainingProcess.stderr.on('data', (data) => {
    mainWindow?.webContents.send('training-log', data.toString());
  });

  trainingProcess.on('close', (code) => {
    mainWindow?.webContents.send('training-log', `Training finished with code ${code}`);
    trainingProcess = null;
  });
});

ipcMain.on('stop-training', () => {
  if (trainingProcess) {
    trainingProcess.kill('SIGINT');
    trainingProcess = null;
    mainWindow?.webContents.send('training-log', 'Training stopped by user');
  }
});
