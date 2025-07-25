import { app, BrowserWindow } from 'electron';
import electronReload from 'electron-reload';
import path from 'path';

import { createWindow } from './window.js';
import { serve } from './config.js';
import { getLogger } from './logger.js'
import { setupIpcHandlers } from './ipc.js';

// If serving, use hot reload
const logger = getLogger("main");
if(serve){
    const electronPath = path.join(app.getAppPath(), './node_modules', '.bin', 'electron');
    electronReload(app.getAppPath(), {
        electron: electronPath,
        hardResetMethod: "exit",
        appArgv: process.argv as [string]
    });
}

// TODO: Show "Report Crash" dialog
const handleCrash = (err: Error) => {
    logger.error(err);
};

// Create window on electron initialization
app.whenReady()
    .then(setupIpcHandlers)    
    .then(createWindow)
    .catch(handleCrash);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if ( process.platform !== 'darwin' ) {
        app.quit()
    }
});

// Restore
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});