import { Component, computed, inject, Injector, OnDestroy, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';

import { ElectronService } from '../../services/electron/electron.service';
import { Note } from '../../models/note';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

const NOTE_FILE = 'note.json';

interface NoteDraft {
  content: string;
}

@Component({
  selector: 'app-note',
  imports: [FormField],
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss'
})
export class NoteComponent implements OnInit, OnDestroy {
  note = signal(Note.create());

  draft = signal<NoteDraft>({ content: '' });
  noteForm = form(this.draft);

  private readonly electron = inject(ElectronService);
  private readonly injector = inject(Injector);
  private contentChangeSub?: Subscription;

  ngOnInit(): void {
    this.electron.loadNote(NOTE_FILE).then(data => {
      const loaded = data ? Note.from(data) : Note.create();
      this.note.set(loaded);
      this.draft.set({ content: loaded.content ?? '' });
    });

    const contentValue = computed(() => this.noteForm.content().value());

    this.contentChangeSub = toObservable(contentValue, { injector: this.injector })
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(content => {
        this.note.update(n => n.withContent(content));
        this.saveNote();
      });
  }

  ngOnDestroy(): void {
    this.contentChangeSub?.unsubscribe();
  }

  private saveNote(): void {
    this.electron.saveNote(NOTE_FILE, this.note().toData()).then(() => {
      console.debug('Note saved successfully');
    });
  }
}
