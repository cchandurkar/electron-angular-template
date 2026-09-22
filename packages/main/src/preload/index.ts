import { contextBridge, ipcRenderer } from 'electron/renderer';
import type { IpcRendererEvent } from 'electron';
import {
  INVOKE_CHANNELS,
  SEND_CHANNELS,
  PUSH_CHANNELS,
  type ElectronBridge,
  type InvokeArgs,
  type InvokeChannel,
  type InvokeResult,
  type ProcessBridge,
  type PushChannel,
  type PushPayload,
  type SendArgs,
  type SendChannel
} from '@local/shared';

const invokeAllowed = new Set<string>(INVOKE_CHANNELS);
const sendAllowed = new Set<string>(SEND_CHANNELS);
const pushAllowed = new Set<string>(PUSH_CHANNELS);

const bridge: ElectronBridge = {
  invoke<C extends InvokeChannel>(channel: C, ...args: InvokeArgs<C>): Promise<InvokeResult<C>> {
    if (!invokeAllowed.has(channel)) {
      throw new Error(`IPC invoke blocked: '${channel}' is not in INVOKE_CHANNELS`);
    }
    return ipcRenderer.invoke(channel, ...args) as Promise<InvokeResult<C>>;
  },

  send<C extends SendChannel>(channel: C, ...args: SendArgs<C>): void {
    if (!sendAllowed.has(channel)) {
      throw new Error(`IPC send blocked: '${channel}' is not in SEND_CHANNELS`);
    }
    ipcRenderer.send(channel, ...args);
  },

  on<C extends PushChannel>(channel: C, listener: (payload: PushPayload<C>) => void): () => void {
    if (!pushAllowed.has(channel)) {
      throw new Error(`IPC on blocked: '${channel}' is not in PUSH_CHANNELS`);
    }
    const wrapped = (_event: IpcRendererEvent, payload: PushPayload<C>) => listener(payload);
    ipcRenderer.on(channel, wrapped as any);
    return () => ipcRenderer.removeListener(channel, wrapped as any);
  }
};

const processApi: ProcessBridge = {
  type: 'renderer',
  platform: process.platform
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronApi', bridge);
    contextBridge.exposeInMainWorld('process', processApi);
  } catch (error) {
    console.error(error);
  }
} else {
  // Non-isolated context — dev fallback only, never in production
  (window as unknown as { electronApi: ElectronBridge }).electronApi = bridge;
}
