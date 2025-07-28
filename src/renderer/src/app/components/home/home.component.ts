import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'

import { ElectronService } from '../../services/electron/electron.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  providers: [ElectronService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  private electron = inject(ElectronService);
 
  versions: Record<string, string | undefined> = {};
  
  title = 'Electron Angular Template';
  text = '';

  constructor() {
    this.versions = this.electron.versions();
  }

  minimizeWindow() {
    if (!this.electron.isElectron) return;
    window.electronApi.windowMinimize();
  }

  closeWindow() {
    if (!this.electron.isElectron) return;
    window.electronApi.windowClose();
  }

  toggleMaximizeWindow() {
    if (!this.electron.isElectron) return;
    window.electronApi.windowToggleMaximize();
  }

}
