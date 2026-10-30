import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ISecretsManagerService, ISettings } from '@Core';

export class SecretsManagerService implements ISecretsManagerService {
  private readonly client: SecretsManagerClient;
  private readonly cache: Map<string, Promise<string>> = new Map();

  constructor(settings: ISettings) {
    this.client = new SecretsManagerClient({
      region: settings.awsRegion,
      endpoint: settings.awsEndpointUrl || undefined,
      credentials: {
        accessKeyId: settings.awsAccessKeyId,
        secretAccessKey: settings.awsSecretAccessKey,
      },
    });
  }

  async getSecretString(secretName: string): Promise<string> {
    const cached = this.cache.get(secretName);
    if (cached) {
      return cached;
    }

    const fetchPromise = this.fetchSecretString(secretName).catch((error: unknown) => {
      this.cache.delete(secretName);
      throw error;
    });

    this.cache.set(secretName, fetchPromise);
    return fetchPromise;
  }

  private async fetchSecretString(secretName: string): Promise<string> {
    const result = await this.client.send(new GetSecretValueCommand({ SecretId: secretName }));
    if (!result.SecretString) {
      throw new Error(`SECRET_NOT_FOUND:${secretName}`);
    }
    return result.SecretString;
  }

  async getSecretJson<T>(secretName: string): Promise<T> {
    const secretString = await this.getSecretString(secretName);
    return JSON.parse(secretString) as T;
  }
}
