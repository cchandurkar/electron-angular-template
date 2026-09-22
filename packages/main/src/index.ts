import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';

import { createWindow } from './window.js';
import { serve } from './config.js';
import logger from './logger.js';
import { setupIpcHandlers } from './ipc.js';
import path from 'path';
import unhandled from 'electron-unhandled';

if (serve) {
  import('electron-debug').then(debug => debug.default({ isEnabled: true, showDevTools: false }));
}

unhandled({
  logger: err => logger.error(err),
  showDialog: true
});

// TODO: Show "Report Crash" dialog
const handleCrash = (err: Error) => {
  logger.error(err);
  throw err;
};

// In dev, `electron .` has no bundled .icns, so the Dock shows the default
// Electron icon unless we set it explicitly. Packaged mac builds don't need
// this — electron-builder embeds the generated .icns in the .app bundle.
if (serve && process.platform === 'darwin') {
  app.dock?.setIcon(path.join(app.getAppPath(), 'assets/icons/icon.png'));
}

app.whenReady().then(setupIpcHandlers).then(createWindow).catch(handleCrash);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS: re-create a window when the dock icon is clicked with no windows open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Setup hot reload
if (serve) {
  const paths = ['dist/main', '../shared/dist'];
  // Delay starting the watcher so this instance doesn't immediately re-trigger
  // on files still being written by the tsc compilation that spawned it
  setTimeout(() => {
    import('chokidar').then(chokidar => {
      const absPaths = paths.map(p => path.join(app.getAppPath(), p));
      let relaunchTimer: ReturnType<typeof setTimeout> | null = null;
      chokidar.watch(absPaths, { persistent: true }).on('change', changedPath => {
        logger.debug(`File changed: ${changedPath}`);
        if (relaunchTimer) clearTimeout(relaunchTimer);
        relaunchTimer = setTimeout(() => {
          // spawn with stdio:'inherit' keeps the terminal stdout/stderr connected
          // across restarts — unlike app.relaunch() which breaks the terminal pipe
          const child = spawn(process.execPath, process.argv.slice(1), {
            stdio: 'inherit'
          });
          child.unref();
          app.exit(0);
        }, 500);
      });
    });
  }, 1500);
}
