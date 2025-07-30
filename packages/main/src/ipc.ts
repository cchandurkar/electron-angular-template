import { ipcMain, dialog, BrowserWindow } from 'electron/main';

export const setupIpcHandlers = () => {
  // Handle window events
  ipcMain.on('window:close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.close();
    }
  });

  ipcMain.on('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      console.log('Minimizing window');
      win.minimize();
    }
  });

  ipcMain.on('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on('window:versions', () => {
    return {
      ...process.versions
    };
  });

  // Handle file operations
  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({});
    if (!canceled) {
      return filePaths[0];
    }
  });
};
