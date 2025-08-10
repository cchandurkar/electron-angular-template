import { app, BrowserWindow } from 'electron';

import { createWindow } from './window.js';
import { serve } from './config.js';
import logger from './logger.js';
import { setupIpcHandlers } from './ipc.js';
import path from 'path';
import unhandled from 'electron-unhandled';

if (serve) {
  import('electron-debug').then(debug => debug.default({ isEnabled: true, showDevTools: true }));
}

// Handle unhandled errors
unhandled({
  logger: err => logger.error(err),
  showDialog: true
});

// TODO: Show "Report Crash" dialog
const handleCrash = (err: Error) => {
  logger.error(err);
  throw err;
};

// Create window on electron initialization
app.whenReady().then(setupIpcHandlers).then(createWindow).catch(handleCrash);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Restore
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Setup hot reload
if (serve) {
  const paths = ['src/main', 'src/preload'];
  import('chokidar').then(chokidar => {
    const absPaths = paths.map(p => path.join(app.getAppPath(), p));
    chokidar.watch(absPaths, { persistent: true, interval: 0 }).on('change', path => {
      console.info(`File changed: ${path}`);
      app.relaunch();
    });
  });
}
