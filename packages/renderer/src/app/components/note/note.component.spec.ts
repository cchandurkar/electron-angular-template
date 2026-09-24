import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { NoteComponent } from './note.component';

describe('NoteComponent', () => {
  let component: NoteComponent;
  let fixture: ComponentFixture<NoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(NoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should record the last edited timestamp after content changes and debounce elapses', async () => {
    expect(component.lastEditedAt()).toBeNull();

    component.noteForm.content().value.set('hello world');
    await new Promise(resolve => setTimeout(resolve, 600));

    expect(component.lastEditedAt()).toBeInstanceOf(Date);
  });
});
