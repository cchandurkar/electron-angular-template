import type { NoteData } from '../models/note.js';

// ─────────────────────────────────────────────────────────────────────────────
// Payload shapes (used by the channel maps below)
// ─────────────────────────────────────────────────────────────────────────────

/** Node/Electron platform identifier — matches Node's process.platform values. */
export type Platform =
  | 'darwin'
  | 'win32'
  | 'linux'
  | 'aix'
  | 'android'
  | 'freebsd'
  | 'haiku'
  | 'netbsd'
  | 'openbsd'
  | 'sunos'
  | 'cygwin';

export interface AppVersions {
  app: string;
  node: string;
  chrome: string;
  electron: string;
  platform: Platform;
}

export type UpdaterStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available'; version: string }
  | { state: 'downloading'; percent: number }
  | { state: 'ready'; version: string }
  | { state: 'error'; message: string };

// ─────────────────────────────────────────────────────────────────────────────
// Channel maps — add a new channel here, one line, nothing else to touch.
// Everything below (types + the runtime allow-lists preload uses to
// validate channel names) is derived from these objects automatically.
//
// The value on the right of `:` is never read at runtime — it only exists
// so TypeScript can infer a type from it. Treat it as a type annotation.
// ─────────────────────────────────────────────────────────────────────────────

type InvokeDef<Args extends unknown[], Result> = { args: Args; result: Result };

/** renderer → main → renderer (request/response via ipcMain.handle / ipcRenderer.invoke) */
const INVOKE_CHANNEL_DEFS = {
  'app:versions': undefined as unknown as InvokeDef<[], AppVersions>,
  'note:save': undefined as unknown as InvokeDef<[filename: string, note: NoteData], void>,
  'note:load': undefined as unknown as InvokeDef<[filename: string], NoteData | null>
};

/** renderer → main fire-and-forget (ipcMain.on / ipcRenderer.send) */
const SEND_CHANNEL_DEFS = {
  'window:close': [] as [],
  'window:minimize': [] as [],
  'window:maximize': [] as []
};

/** main → renderer broadcast (webContents.send / ipcRenderer.on) */
const PUSH_CHANNEL_DEFS = {
  'theme:changed': undefined as unknown as { mode: 'light' | 'dark' },
  'updater:status': undefined as unknown as UpdaterStatus
};

// ─────────────────────────────────────────────────────────────────────────────
// Derived types
// ─────────────────────────────────────────────────────────────────────────────

export type InvokeChannels = typeof INVOKE_CHANNEL_DEFS;
export type SendChannels = typeof SEND_CHANNEL_DEFS;
export type PushChannels = typeof PUSH_CHANNEL_DEFS;

export type InvokeChannel = keyof InvokeChannels;
export type SendChannel = keyof SendChannels;
export type PushChannel = keyof PushChannels;

export type InvokeArgs<C extends InvokeChannel> = InvokeChannels[C]['args'];
export type InvokeResult<C extends InvokeChannel> = InvokeChannels[C]['result'];
export type SendArgs<C extends SendChannel> = SendChannels[C];
export type PushPayload<C extends PushChannel> = PushChannels[C];

// ─────────────────────────────────────────────────────────────────────────────
// Derived runtime allow-lists — Object.keys() of the maps above, so they can
// never drift from the type-level channel maps.
// ─────────────────────────────────────────────────────────────────────────────

export const INVOKE_CHANNELS = Object.keys(INVOKE_CHANNEL_DEFS) as InvokeChannel[];
export const SEND_CHANNELS = Object.keys(SEND_CHANNEL_DEFS) as SendChannel[];
export const PUSH_CHANNELS = Object.keys(PUSH_CHANNEL_DEFS) as PushChannel[];

// ─────────────────────────────────────────────────────────────────────────────
// Bridge interfaces — implemented by preload, consumed by renderer service
// ─────────────────────────────────────────────────────────────────────────────

export interface ElectronBridge {
  invoke<C extends InvokeChannel>(channel: C, ...args: InvokeArgs<C>): Promise<InvokeResult<C>>;
  send<C extends SendChannel>(channel: C, ...args: SendArgs<C>): void;
  on<C extends PushChannel>(channel: C, listener: (payload: PushPayload<C>) => void): () => void;
}

export interface ProcessBridge {
  readonly type: 'renderer';
  readonly platform: Platform;
}
