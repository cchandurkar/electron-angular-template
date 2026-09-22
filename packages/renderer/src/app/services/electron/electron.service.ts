import { DestroyRef, inject, Injectable, signal, type Signal } from '@angular/core';
import type { AppVersions, NoteData, Platform, UpdaterStatus } from '@local/shared';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly _versions = signal<AppVersions | null>(null);
  private readonly _updaterStatus = signal<UpdaterStatus>({ state: 'idle' });

  readonly versions: Signal<AppVersions | null> = this._versions.asReadonly();
  readonly updaterStatus: Signal<UpdaterStatus> = this._updaterStatus.asReadonly();

  constructor() {
    if (!this.isElectron) return;
    const off = window.electronApi.on('updater:status', status => this._updaterStatus.set(status));
    this.destroyRef.onDestroy(off);
    void this.loadVersions();
  }

  // ─── Environment detection ─────────────────────────────────────────────────

  get isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronApi;
  }

  get platform(): Platform | 'web' {
    return this.isElectron ? window.process.platform : 'web';
  }

  get isWindows(): boolean {
    return this.platform === 'win32';
  }

  get isMac(): boolean {
    return this.platform === 'darwin';
  }

  get isLinux(): boolean {
    return this.platform === 'linux';
  }

  // ─── Window controls ──────────────────────────────────────────────────────

  closeWindow(): void {
    if (this.isElectron) window.electronApi.send('window:close');
  }

  minimizeWindow(): void {
    if (this.isElectron) window.electronApi.send('window:minimize');
  }

  toggleMaximize(): void {
    if (this.isElectron) window.electronApi.send('window:maximize');
  }

  // ─── App info ─────────────────────────────────────────────────────────────

  async loadVersions(): Promise<void> {
    if (!this.isElectron) return;
    const versions = await window.electronApi.invoke('app:versions');
    this._versions.set(versions);
  }

  // ─── Notes ────────────────────────────────────────────────────────────────

  async saveNote(filename: string, note: NoteData): Promise<void> {
    if (!this.isElectron) return;
    await window.electronApi.invoke('note:save', filename, note);
  }

  async loadNote(filename: string): Promise<NoteData | null> {
    if (!this.isElectron) return null;
    const data = await window.electronApi.invoke('note:load', filename);
    return data;
  }
}
