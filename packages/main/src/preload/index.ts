import { contextBridge, ipcRenderer } from 'electron/renderer';
import type { IpcRendererEvent } from 'electron';

// -----------------------------------
// Custom API
// -----------------------------------

export const api = {

  // Window control methods
  windowClose: () => ipcRenderer.send('window:close'),
  windowMinimize: () => ipcRenderer.send('window:minimize'),
  windowToggleMaximize: () => ipcRenderer.send('window:maximize'),
  windowVersions: () => {
    return {
      ...process.versions
    }
  },

  // Events and IPC messages
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  sendSync: (channel: string, ...args: any[]) => ipcRenderer.sendSync(channel, ...args),
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.once(channel, listener),
  emit: (channel: string, ...args: any[]) => ipcRenderer.emit(channel, ...args),

  // Listeners
  removeListener: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.removeListener(channel, listener),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),

  // Generic event listener
  on: (eventName: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(eventName, (_event, ...args: any[]) => callback(...args));
  }

}

// -----------------------------------
// Export in main
// -----------------------------------

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronApi', api);
    contextBridge.exposeInMainWorld('process', process);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electronApi = api
  window.process = process;
}