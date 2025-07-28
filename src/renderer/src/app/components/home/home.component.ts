import { Component, inject } from '@angular/core';

import { ElectronService } from '../../services/electron/electron.service';

@Component({
  selector: 'app-home',
  imports: [],
  providers: [ElectronService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  private electron = inject(ElectronService);
 
  versions: Record<string, string | undefined> = {};

  constructor() {
    this.versions = this.electron.versions();
  }

}
