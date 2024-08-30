import { BrowserWindow, shell, app } from 'electron';
import url from 'url';
import path from 'path';

import { isServing } from './config';
import { getLogger } from './logger';


const logger = getLogger('main');

/**
 * Creates a browser window. If launched with `--serve` flag, it will enable hot reload and load the
 * @returns 
 */
export const createWindow = async (): Promise<BrowserWindow> => {

    logger.log("App Path", app.getAppPath());

    // dist URL
    let serveURL = `http://localhost:4200`;
    let distURL = url.format({
      pathname: path.join(app.getAppPath(), `./dist/renderer/index.html`),
      protocol: 'file:',
      slashes: true
    });

    // Create the browser window
    const preloadPath = path.join(app.getAppPath(), 'dist/preload/index.js');
    logger.log("preloadPath", preloadPath);
    let win: BrowserWindow = new BrowserWindow({
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

    // Load the local URL for development or the local
    // html file for production
    if (!app.isPackaged && isServing) {
        win.loadURL(serveURL)
    } else {
        win.loadFile(distURL)
    }

    // Load app in window
    // win.loadURL( isServing ? serveURL: distURL );
    win.once('ready-to-show', () => { win.show(); });
  
    // Open Debug Tools
    if(isServing) {
        win.webContents.openDevTools();
    }

    // Open in external browser
    // win.webContents.openDevTools();
    let wc = win.webContents;
    wc.on('will-navigate', (e, url) => {
    if (url != wc.getURL()) {
        e.preventDefault();
        shell.openExternal(url);
    }
    });

    // Return the window
    return win;

}