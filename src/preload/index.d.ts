import { api } from './index.js';

declare global {
  interface Window {
    electronApi: typeof api;
  }
}