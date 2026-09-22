import type { NoteData } from '@local/shared';

export type { NoteData } from '@local/shared';

/** Renderer-side class with behavior. Hydrate from NoteData after the IPC boundary. Never send this class over IPC — always toData() first. */
export class Note implements NoteData {
  readonly id: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;

  private constructor(data: NoteData) {
    this.id = data.id;
    this.content = data.content;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static create(content = ''): Note {
    const now = new Date().toISOString();
    return new Note({ id: crypto.randomUUID(), content, createdAt: now, updatedAt: now });
  }

  static from(data: NoteData): Note {
    return new Note(data);
  }

  toData(): NoteData {
    return {
      id: this.id,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  withContent(content: string | null): Note {
    return new Note({ ...this.toData(), content, updatedAt: new Date().toISOString() });
  }
}
