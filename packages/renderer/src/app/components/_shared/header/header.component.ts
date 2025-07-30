import { Component, inject, Input } from '@angular/core';
import { ElectronService } from '../../../services/electron/electron.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() title = 'note.txt';

  private electron = inject(ElectronService);

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
