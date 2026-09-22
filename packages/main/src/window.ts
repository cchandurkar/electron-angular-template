import { BrowserWindow, shell, app } from 'electron';
import path from 'path';

import { serve } from './config.js';
import logger from './logger.js';

/** Creates the main BrowserWindow — loads the Angular dev server with --serve, otherwise the built renderer. */
export const createWindow = (): BrowserWindow => {
  const serveURL = 'http://localhost:4200';
  const distURL = './dist/renderer/browser/index.html';
  const preloadPath = './dist/main/preload/index.js';
  // Windows/Linux use this for the window/taskbar icon; macOS ignores it in
  // favor of the Dock icon (packaged .app bundles it from the .icns instead —
  // see index.ts for the dev-mode Dock icon).
  const iconPath = './assets/icons/icon-512.png';

  const win: BrowserWindow = new BrowserWindow({
    width: 450,
    height: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(app.getAppPath(), iconPath),
    webPreferences: {
      nodeIntegration: false,
      sandbox: true,
      allowRunningInsecureContent: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(app.getAppPath(), preloadPath)
    }
  });

  if (serve) {
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

  // Never open new Electron windows/popups — external http(s) URLs go to the
  // system browser, everything else is denied.
  wc.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) {
      shell.openExternal(url).catch(handleWindowError);
    }
    return { action: 'deny' };
  });

  // This app needs no camera/mic/geolocation/notifications — deny by default.
  wc.session.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  win.on('closed', () => {
    win.destroy();
  });

  return win;
};

const handleWindowError = (error: Error) => {
  logger.error('Window Error:', error);
};
