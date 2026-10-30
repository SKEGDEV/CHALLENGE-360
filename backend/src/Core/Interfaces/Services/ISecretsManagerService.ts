export interface ISecretsManagerService {
  getSecretString(secretName: string): Promise<string>;
  getSecretJson<T>(secretName: string): Promise<T>;
}
