import type { ElectronBridge, ProcessBridge } from '@local/shared';

declare global {
  interface Window {
    electronApi: ElectronBridge;
    process: ProcessBridge;
  }
}
