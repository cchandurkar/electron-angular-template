import { ipcMain, dialog, BrowserWindow } from 'electron/main';

export const setupIpcHandlers = () => {

  // Handle window events
  ipcMain.handle('window:close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.close();
    }
  });

  ipcMain.handle('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.minimize();
    }
  });

  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.maximize();
    }
  });

  ipcMain.handle('window:versions', () => {
    return {
      ...process.versions
    };
  });

  // Handle file operations
  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({});
    if (!canceled) {
      return filePaths[0]
    }
  });

};