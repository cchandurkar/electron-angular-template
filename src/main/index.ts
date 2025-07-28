import { app, BrowserWindow } from 'electron';;

import { createWindow } from './window.js';
import { serve } from './config.js';
import { getLogger } from './logging/index.js'
import { setupIpcHandlers } from './ipc.js';

// If serving, use hot reload
const logger = getLogger("main");
if(serve){
    import('electron-debug').then(debug => debug.default({isEnabled: true, showDevTools: true}));
    import('electron-reloader').then(reloader => reloader.default(module));
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