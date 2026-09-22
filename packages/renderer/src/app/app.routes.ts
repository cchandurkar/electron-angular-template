import { Routes } from '@angular/router';

import { NoteComponent } from './components/note/note.component';

export const routes: Routes = [
  {
    path: '',
    component: NoteComponent,
    pathMatch: 'full'
  }
];
