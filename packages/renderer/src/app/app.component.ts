import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { ElectronService } from './services/electron/electron.service';
import { NoteComponent } from './components/note/note.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly electron = inject(ElectronService);

  // Bridges the routed NoteComponent's signal to the footer since router-outlet
  // has no direct template binding for arbitrary routed component outputs.
  private readonly activeNote = signal<NoteComponent | null>(null);

  readonly lastEditedAt = computed(() => this.activeNote()?.lastEditedAt() ?? null);

  get version(): string | undefined {
    return this.electron.versions()?.app;
  }

  onRouteActivate(component: unknown): void {
    this.activeNote.set(component instanceof NoteComponent ? component : null);
  }

  // Only show the year when the edit happened in a different year than today.
  dateFormat(date: Date): string {
    const sameYear = date.getFullYear() === new Date().getFullYear();
    return sameYear ? "MMM d 'at' h:mm a" : "MMM d, y 'at' h:mm a";
  }
}
