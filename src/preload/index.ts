import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// -----------------------------------
// Custom API
// -----------------------------------

const api = {
  close: () => electronAPI.ipcRenderer.invoke('window:close'),
  minimize: () => electronAPI.ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => electronAPI.ipcRenderer.invoke('window:maximize'),
  versions: () => {
    return {
      ...process.versions
    }
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
    contextBridge.exposeInMainWorld('electron', {
      process: electronAPI.process,
      ipc: electronAPI.ipcRenderer
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
