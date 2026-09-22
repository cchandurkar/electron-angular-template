/** Wire/storage shape — safe across IPC and JSON serialization. */
export interface NoteData {
  id: string;
  content: string | null;
  /** ISO 8601 string — survives JSON round-trip and structured clone without distortion. */
  createdAt: string;
  /** ISO 8601 string */
  updatedAt: string;
}
