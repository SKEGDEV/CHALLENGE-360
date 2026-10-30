import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { IStorageService } from '@Core';

export interface S3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

export class S3StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(credentials: S3Credentials, endpointUrl: string) {
    this.bucket = credentials.bucket;
    this.client = new S3Client({
      region: credentials.region,
      endpoint: endpointUrl || undefined,
      forcePathStyle: Boolean(endpointUrl),
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }),
    );
    return this.getFileUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  getFileUrl(key: string): string {
    return `${this.bucket}/${key}`;
  }
}
