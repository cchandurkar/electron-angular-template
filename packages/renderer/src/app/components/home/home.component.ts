import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

import { ElectronService } from '../../services/electron/electron.service';
import { Note } from '../../models/note';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HeaderComponent } from '../_shared/header/header.component';
import { FooterComponent } from '../_shared/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [FormsModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  providers: [ElectronService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  note: Note = new Note('');

  textareaControl = new FormControl(this.note.content);

  title = 'Electron Angular Template';

  constructor() {}

  // -----------------------------------------
  // Lifecycle hooks
  // -----------------------------------------

  ngOnInit(): void {
    this.textareaControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(content => {
        console.log('Content changed');
        this.note.setContent(content);
      });
  }

  ngOnDestroy(): void {
    console.log('HomeComponent destroyed');
  }
}
