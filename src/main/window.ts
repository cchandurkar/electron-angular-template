import { BrowserWindow, shell, app } from 'electron';
import path from 'path';

import { serve } from './config.js';
import { getLogger } from './logging/index.js';

const logger = getLogger('main').child({scope: 'window'});

/**
 * Creates a browser window. If launched with `--serve` flag, it will enable hot reload and load the
 * @returns 
 */
export const createWindow = (): BrowserWindow => {

    // dist URL
    const serveURL = `http://localhost:4200`;
    const distURL = `./dist/renderer/browser/index.html`;
    const preloadPath = path.join(app.getAppPath(), 'dist/preload/index.js');

    // Create the browser window
    let win: BrowserWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: serve,
            contextIsolation: true,
            preload: preloadPath,
            sandbox: false
        }
    });

    if(serve) {
        win.loadURL(serveURL);
    } else {
        win.loadFile(distURL);
    }

    win.once('ready-to-show', () => win.show());

    // Open hyperlinks in external browser
    const wc = win.webContents;
    wc.on('will-navigate', (e, url) => {
        if (url != wc.getURL()) {
            e.preventDefault();
            shell.openExternal(url).catch(handleWindowError);
        }
    });

    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null;
    });

    return win;

}

const handleWindowError = (error: Error) => {
    logger.error("Window Error:", error);
};