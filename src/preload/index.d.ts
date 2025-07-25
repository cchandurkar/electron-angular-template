import type { IpcRendererEvent } from 'electron';

export interface ElectronAPI {
  // Window control methods
  windowClose: () => void;
  windowMinimize: () => void;
  windowToggleMaximize: () => void;
  windowVersions: () => Record<string, string>;

  // Events and IPC messages
  send: (channel: string, ...args: any[]) => void;
  sendSync: (channel: string, ...args: any[]) => any;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  once: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
  emit: (channel: string, ...args: any[]) => void;

  // Listeners
  removeListener: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;

  // Generic event listener
  on: (eventName: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electronApi: ElectronAPI;
  }
}