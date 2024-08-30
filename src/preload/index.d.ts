import { ElectronAPI, IpcRenderer, NodeProcess } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: {
      process: NodeProcess
      ipc: IpcRenderer
    },
    api: {
      close: () => Promise<any>;
      minimize: () => Promise<any>;
      toggleMaximize: () => Promise<any>;
      versions: () => Promise<any>;
    }
  }
}
