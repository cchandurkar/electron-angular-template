import { app, BrowserWindow } from 'electron/main';
import type { NoteData } from '@local/shared';
import { handle, listen } from './ipc-bridge.js';
import { Storage } from './storage.js';
import logger from './logger.js';

const storage = new Storage();

export const setupIpcHandlers = (): void => {
  // ─── Window controls (fire-and-forget) ────────────────────────────────────
  listen('window:close', event => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  listen('window:minimize', event => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  listen('window:maximize', event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });

  // ─── App info ─────────────────────────────────────────────────────────────
  handle('app:versions', () => ({
    app: app.getVersion(),
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    platform: process.platform
  }));

  // ─── Notes ────────────────────────────────────────────────────────────────
  handle('note:save', async (_event, filename, note): Promise<void> => {
    await storage.saveFile(filename, JSON.stringify(note, null, 2));
    logger.info(`Saved note to ${filename}`);
  });

  handle('note:load', async (_event, filename): Promise<NoteData | null> => {
    try {
      const content = await storage.readFile(filename);
      return JSON.parse(content) as NoteData;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
  });
};
