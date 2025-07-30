export class Note {
  public id: string;
  public content: string | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(content: string) {
    this.id = crypto.randomUUID();
    this.content = content;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  setContent(content: string | null): void {
    this.content = content;
    this.updatedAt = new Date();
  }
}
