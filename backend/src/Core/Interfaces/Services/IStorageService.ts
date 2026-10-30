export interface IStorageService {
  uploadFile(key: string, body: Buffer, contentType: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): string;
}
