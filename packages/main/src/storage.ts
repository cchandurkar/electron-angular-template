import fs from 'fs';
import path from 'path';
import logger from './logger.js';
import { app } from 'electron';

export class Storage {
  constructor(private readonly basePath: string = app.getPath('userData')) {}

  private resolvePath(file: string): string {
    return path.join(this.basePath, path.basename(file));
  }

  async saveFile(file: string, content: string) {
    logger.info(`Saving file: ${file} at ${this.basePath}`);
    const filePath = this.resolvePath(file);
    const dirName = path.dirname(filePath);
    await fs.promises.mkdir(dirName, { recursive: true });
    await fs.promises.writeFile(filePath, content);
  }

  async readFile(file: string) {
    const filePath = this.resolvePath(file);
    return fs.promises.readFile(filePath, 'utf-8');
  }

  async fileExists(file: string): Promise<boolean> {
    const filePath = this.resolvePath(file);
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
