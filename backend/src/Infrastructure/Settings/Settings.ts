import { ISettings } from '@Core';

export class Settings implements ISettings {
  public readonly port: number = Number(process.env.PORT) || 3000;
  public readonly nodeEnv: string = process.env.NODE_ENV || 'development';
  public readonly isDebug: boolean = this.nodeEnv !== 'production';
  public readonly allowedOrigins: string[] = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  public readonly jwtSecret: string = process.env.JWT_SECRET || '';
  public readonly jwtAccessTokenExpiresInSeconds: number =
    Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) || 900;
  public readonly jwtRefreshTokenExpiresInSeconds: number =
    Number(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS) || 1209600;

  public readonly awsRegion: string = process.env.AWS_REGION || 'us-east-1';
  public readonly awsEndpointUrl: string = process.env.AWS_ENDPOINT_URL || '';
  public readonly awsAccessKeyId: string = process.env.AWS_ACCESS_KEY_ID || '';
  public readonly awsSecretAccessKey: string = process.env.AWS_SECRET_ACCESS_KEY || '';
  public readonly s3BucketName: string = process.env.S3_BUCKET_NAME || '';
  public readonly secretDbConnectionStringName: string =
    process.env.SECRET_DB_CONNECTION_STRING_NAME || '';
  public readonly secretS3CredentialsName: string = process.env.SECRET_S3_CREDENTIALS_NAME || '';
  public readonly preSignedUrlExpirationSeconds: number =
    Number(process.env.PRESIGNED_URL_EXPIRATION_SECONDS) || 900;

  public readonly secretSmtpCredentialsName: string = process.env.SECRET_SMTP_CREDENTIALS_NAME || '';
  public readonly secretSqsCredentialsName: string = process.env.SECRET_SQS_CREDENTIALS_NAME || '';

  public readonly sqsQueueName: string = process.env.SQS_QUEUE_NAME || 'shopcart-shipment-notifications';
  public readonly sqsDlqName: string = process.env.SQS_DLQ_NAME || 'shopcart-shipment-notifications-dlq';
  public readonly sqsMaxReceiveCount: number = Number(process.env.SQS_MAX_RECEIVE_COUNT) || 5;
  public readonly sqsWaitTimeSeconds: number = Number(process.env.SQS_WAIT_TIME_SECONDS) || 10;

  public readonly preOrderExpirationMinutes: number = Number(process.env.PREORDER_EXPIRATION_MINUTES) || 15;
  public readonly preOrderWorkerIntervalMs: number = Number(process.env.PREORDER_WORKER_INTERVAL_MS) || 1000;
  public readonly taxIvaPercentage: number = Number(process.env.TAX_IVA_PERCENTAGE) || 12;
}
