import { api } from '../index';

declare global {
  interface Window {
    electronApi: typeof api;
    process: NodeJS.Process;
  }
}
