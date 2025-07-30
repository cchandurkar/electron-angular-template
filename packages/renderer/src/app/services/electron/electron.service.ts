import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  /**
   * This service provides a way to access Electron APIs in an Angular application.
   * It checks if the application is running in an Electron environment and exposes
   * the Electron API through the `window.electron` object.
   */

  constructor() {
    if (this.isElectron) {
      this.setupElectronIpc();
    }
  }

  versions(): Record<string, string | undefined> {
    return this.isElectron ? window.electronApi.windowVersions() : {};
  }

  /**
   * Sets up Electron IPC (Inter-Process Communication) listeners.
   *
   * @returns void
   */
  setupElectronIpc(): void {
    if (!window.electronApi) return;

    window.electronApi.on('dialog:openFile', (filePath: string) => {
      console.log('File opened:', filePath);
    });
  }

  /**
   * Checks if the application is running in an Electron environment.
   *
   * @returns boolean - true if running in Electron, false otherwise
   */
  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
