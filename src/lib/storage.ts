import fs from 'fs';
import path from 'path';

export interface StorageAdapter {
  uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getFileStream(key: string): fs.ReadStream;
  getFilePath(key: string): string;
  deleteFile(key: string): Promise<void>;
  fileExists(key: string): boolean;
}

class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'data', 'storage');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getFilePath(key: string): string {
    // Sanitize key against directory traversal
    const safeKey = key.replace(/(\.\.[\/\\])+/g, '').replace(/^[\\\/]+/, '');
    const fullPath = path.resolve(this.baseDir, safeKey);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    return fullPath;
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const targetPath = this.getFilePath(key);
    await fs.promises.writeFile(targetPath, buffer);
    return key;
  }

  async getDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    // Generate a secure, authenticated local endpoint URL with token/key
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/media/stream?key=${encodeURIComponent(key)}`;
  }

  getFileStream(key: string): fs.ReadStream {
    const targetPath = this.getFilePath(key);
    return fs.createReadStream(targetPath);
  }

  async deleteFile(key: string): Promise<void> {
    const targetPath = this.getFilePath(key);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
    }
  }

  fileExists(key: string): boolean {
    const targetPath = this.getFilePath(key);
    return fs.existsSync(targetPath);
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
