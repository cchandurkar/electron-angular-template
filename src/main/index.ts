import { app, BrowserWindow } from 'electron';
import electronReload from 'electron-reload';
import path from 'path';

import { createWindow } from './window';
import { isServing } from './config';
import { getLogger } from './logger'

// If serving, use hot reload
const logger = getLogger("main");
if(isServing){
    let electronPath = path.join(app.getAppPath(), './node_modules', '.bin', 'electron.cmd');
    logger.info("electronPath", electronPath);
    electronReload(app.getAppPath(), {
        electron: electronPath,
        hardResetMethod: "exit",
        appArgv: process.argv as [string]
    });
}

// TODO: Show "Report Crash" dialog
const handleCrash = (err: any) => {
    logger.error(err);
};

// Create window on electron initialization
app.whenReady()
    .then( createWindow )
    .catch( handleCrash );

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if ( process.platform !== 'darwin' ) {
        app.quit()
    }
});

// Restore
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow().catch( handleCrash );
    }
});


// -----------------------------------
// IPC calls
// -----------------------------------