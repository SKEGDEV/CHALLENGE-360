import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService, StoredFileContent } from '@Core';

export interface S3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

function isNotFoundError(error: unknown): boolean {
  const name = (error as { name?: string })?.name;
  return name === 'NoSuchKey' || name === 'NotFound';
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

  async getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds: number): Promise<string> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async getFile(key: string): Promise<StoredFileContent | null> {
    try {
      const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const bytes = await response.Body?.transformToByteArray();
      if (!bytes) {
        return null;
      }
      return { body: Buffer.from(bytes), contentType: response.ContentType ?? 'application/octet-stream' };
    } catch (error) {
      if (isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }
}
