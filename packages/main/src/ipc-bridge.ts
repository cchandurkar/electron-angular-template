import { BrowserWindow, ipcMain } from 'electron/main';
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import type {
  InvokeArgs,
  InvokeChannel,
  InvokeResult,
  PushChannel,
  PushPayload,
  SendArgs,
  SendChannel
} from '@local/shared';

/** Type-safe wrapper around ipcMain.handle. Handler parameters and return type are inferred from the channel. */
export const handle = <C extends InvokeChannel>(
  channel: C,
  handler: (
    event: IpcMainInvokeEvent,
    ...args: InvokeArgs<C>
  ) => InvokeResult<C> | Promise<InvokeResult<C>>
): void => {
  ipcMain.handle(channel, (event, ...args) => handler(event, ...(args as InvokeArgs<C>)));
};

/** Type-safe wrapper around ipcMain.on (fire-and-forget from renderer). */
export const listen = <C extends SendChannel>(
  channel: C,
  listener: (event: IpcMainEvent, ...args: SendArgs<C>) => void
): void => {
  ipcMain.on(channel, (event, ...args) => listener(event, ...(args as SendArgs<C>)));
};

/** Type-safe main → renderer broadcast. Sends to a specific window, or all windows if omitted. */
export const broadcast = <C extends PushChannel>(
  channel: C,
  payload: PushPayload<C>,
  target?: BrowserWindow
): void => {
  const wins = target ? [target] : BrowserWindow.getAllWindows();
  for (const win of wins) {
    win.webContents.send(channel, payload);
  }
};
