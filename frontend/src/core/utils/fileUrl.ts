import { env } from '@core/config';

export function buildFileUrl(bucketKey: string, contentType = 'image/jpeg'): string {
  return `${env.apiUrl}/api/common/file?${new URLSearchParams({ imageBucketKey: bucketKey, contentType })}`;
}
