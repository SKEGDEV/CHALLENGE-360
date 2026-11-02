export interface StoredFileContent {
  body: Buffer;
  contentType: string;
}

export interface IStorageService {
  uploadFile(key: string, body: Buffer, contentType: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): string;
  getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds: number): Promise<string>;
  getFile(key: string): Promise<StoredFileContent | null>;
}
