import { BrowserWindow, shell, app } from 'electron';
import url from 'url';
import path from 'path';

import { serve } from './config.js';
import { getLogger } from './logger.js';


const logger = getLogger('main');

/**
 * Creates a browser window. If launched with `--serve` flag, it will enable hot reload and load the
 * @returns 
 */
export const createWindow = (): BrowserWindow => {

    logger.log("App Path", app.getAppPath());

    // dist URL
    const serveURL = `http://localhost:4200`;
    const distURL = url.format({
      pathname: path.join(app.getAppPath(), `./dist/renderer/index.html`),
      protocol: 'file:',
      slashes: true
    });

    // Create the browser window
    const preloadPath = path.join(app.getAppPath(), 'dist/preload/index.js');
    const win: BrowserWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        trafficLightPosition: { x: 12, y: 10 },
        show: false,
        webPreferences: {
            preload: preloadPath,
            sandbox: false
        }
    });

    if(serve) {
        import('electron-debug').then(debug => debug.default({isEnabled: true, showDevTools: true}));
        import('electron-reloader').then(reloader => reloader.default(module));
        win.loadURL(serveURL)
    } else {
        win.loadFile(distURL)
    }

    // Load app in window
    // win.loadURL( isServing ? serveURL: distURL );
    win.once('ready-to-show', () => { win.show(); });

    // Open in external browser
    const wc = win.webContents;
    wc.on('will-navigate', (e, url) => {
        if (url != wc.getURL()) {
            e.preventDefault();
            shell.openExternal(url).catch(handleWindowError);
        }
    });

    // Return the window
    return win;

}

const handleWindowError = (error: Error) => {
    logger.error("Window Error:", error);
};