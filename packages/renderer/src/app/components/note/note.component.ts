import {
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';

import { Editor } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { LucideBold, LucideItalic, LucideList, LucideListOrdered } from '@lucide/angular';

import { ElectronService } from '../../services/electron/electron.service';
import { Note } from '../../models/note';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

const NOTE_FILE = 'note.json';

interface NoteDraft {
  content: string;
}

interface ActiveMarks {
  bold: boolean;
  italic: boolean;
  bulletList: boolean;
  orderedList: boolean;
}

const NO_ACTIVE_MARKS: ActiveMarks = {
  bold: false,
  italic: false,
  bulletList: false,
  orderedList: false
};

@Component({
  selector: 'app-note',
  imports: [LucideBold, LucideItalic, LucideList, LucideListOrdered],
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss'
})
export class NoteComponent implements OnInit, OnDestroy {
  note = signal(Note.create());

  draft = signal<NoteDraft>({ content: '' });
  noteForm = form(this.draft);

  readonly lastEditedAt = signal<Date | null>(null);

  readonly activeMarks = signal<ActiveMarks>(NO_ACTIVE_MARKS);

  private readonly editorRoot = viewChild.required<ElementRef<HTMLDivElement>>('editorRoot');
  private readonly bubbleMenuRoot = viewChild.required<ElementRef<HTMLDivElement>>('bubbleMenu');

  private readonly electron = inject(ElectronService);
  private readonly injector = inject(Injector);
  private contentChangeSub?: Subscription;
  private editor?: Editor;

  constructor() {
    // Rebuild the editor whenever its DOM anchors change identity (e.g. HMR
    // recreates the view). `untracked` keeps typing from retriggering this.
    afterRenderEffect(onCleanup => {
      const root = this.editorRoot().nativeElement;
      const bubbleMenuEl = this.bubbleMenuRoot().nativeElement;

      const editor = untracked(() => this.createEditor(root, bubbleMenuEl));
      this.editor = editor;

      onCleanup(() => {
        editor.destroy();
        if (this.editor === editor) {
          this.editor = undefined;
        }
      });
    });
  }

  ngOnInit(): void {
    this.electron.loadNote(NOTE_FILE).then(data => {
      const loaded = data ? Note.from(data) : Note.create();
      const content = loaded.content ?? '';
      this.note.set(loaded);
      this.draft.set({ content });
      this.editor?.commands.setContent(content, { contentType: 'markdown', emitUpdate: false });
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

  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  private createEditor(root: HTMLDivElement, bubbleMenuEl: HTMLDivElement): Editor {
    return new Editor({
      element: root,
      contentType: 'markdown',
      content: this.draft().content,
      extensions: [
        StarterKit.configure({
          heading: false,
          blockquote: false,
          codeBlock: false,
          code: false,
          strike: false,
          horizontalRule: false,
          link: false,
          underline: false
        }),
        Markdown,
        BubbleMenu.configure({
          element: bubbleMenuEl,
          pluginKey: 'noteBubbleMenu',
          shouldShow: ({ editor, from, to }) => from !== to && editor.isEditable,
          options: { placement: 'top', offset: 8 }
        })
      ],
      onTransaction: ({ editor }) => {
        this.activeMarks.set({
          bold: editor.isActive('bold'),
          italic: editor.isActive('italic'),
          bulletList: editor.isActive('bulletList'),
          orderedList: editor.isActive('orderedList')
        });
      },
      onUpdate: ({ editor }) => {
        this.noteForm.content().value.set(editor.getMarkdown());
      }
    });
  }

  private saveNote(): void {
    this.electron.saveNote(NOTE_FILE, this.note().toData()).then(() => {
      console.debug('Note saved successfully');
      this.lastEditedAt.set(new Date(this.note().updatedAt));
    });
  }
}
