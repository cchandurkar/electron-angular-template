import { Component, inject, input } from '@angular/core';
import { LucideMinus, LucideSquare, LucideX } from '@lucide/angular';

import { ElectronService } from '../../../services/electron/electron.service';

@Component({
  selector: 'app-header',
  imports: [LucideMinus, LucideSquare, LucideX],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly title = input('note.txt');

  public electron = inject(ElectronService);

  minimizeWindow(): void {
    this.electron.minimizeWindow();
  }

  closeWindow(): void {
    this.electron.closeWindow();
  }

  toggleMaximizeWindow(): void {
    this.electron.toggleMaximize();
  }
}
