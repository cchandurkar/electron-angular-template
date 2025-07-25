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

  setupElectronIpc(): void {
    window.electronApi.on('dialog:openFile', (filePath: string) => {
      console.log('File opened:', filePath);
    });
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
