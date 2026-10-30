export interface ISettings {
  port: number;
  nodeEnv: string;
  isDebug: boolean;
  allowedOrigins: string[];
  jwtSecret: string;
  jwtAccessTokenExpiresInSeconds: number;
  jwtRefreshTokenExpiresInSeconds: number;

  awsRegion: string;
  awsEndpointUrl: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  s3BucketName: string;
  secretDbConnectionStringName: string;
  secretS3CredentialsName: string;
}
