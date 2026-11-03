import 'dotenv/config';
import sql, { ConnectionPool } from 'mssql';
import { ISettings } from '@Core';
import {
  Settings,
  SecretsManagerService,
  S3StorageService,
  S3Credentials,
  SqsQueueService,
  SqsCredentials,
  SmtpEmailService,
  SmtpCredentials,
} from '@Infrastructure';
import { buildControllers } from './CompositionRoot';
import { createApp } from './app';

async function createPool(connectionString: string): Promise<ConnectionPool | undefined> {
  if (!connectionString) {
    return undefined;
  }

  try {
    return await sql.connect(connectionString);
  } catch (error) {
    console.warn('Database connection failed, starting without a database pool.', error);
    return undefined;
  }
}

async function resolveDbConnectionString(
  settings: ISettings,
  secretsManager: SecretsManagerService,
): Promise<string> {
  if (!settings.secretDbConnectionStringName) {
    return '';
  }

  try {
    return await secretsManager.getSecretString(settings.secretDbConnectionStringName);
  } catch (error) {
    console.warn('Could not read DB connection string from Secrets Manager.', error);
    return '';
  }
}

async function resolveStorageService(
  settings: ISettings,
  secretsManager: SecretsManagerService,
): Promise<S3StorageService | undefined> {
  if (!settings.secretS3CredentialsName) {
    return undefined;
  }

  try {
    const credentials = await secretsManager.getSecretJson<S3Credentials>(settings.secretS3CredentialsName);
    return new S3StorageService(credentials, settings.awsEndpointUrl);
  } catch (error) {
    console.warn('Could not read S3 credentials from Secrets Manager.', error);
    return undefined;
  }
}

async function resolveEmailService(
  settings: ISettings,
  secretsManager: SecretsManagerService,
): Promise<SmtpEmailService | undefined> {
  if (!settings.secretSmtpCredentialsName) {
    return undefined;
  }

  try {
    const credentials = await secretsManager.getSecretJson<SmtpCredentials>(settings.secretSmtpCredentialsName);
    return new SmtpEmailService(credentials);
  } catch (error) {
    console.warn('Could not read SMTP credentials from Secrets Manager.', error);
    return undefined;
  }
}

async function resolveNotificationQueue(
  settings: ISettings,
  secretsManager: SecretsManagerService,
): Promise<{ service: SqsQueueService; queueUrl: string } | undefined> {
  if (!settings.secretSqsCredentialsName) {
    return undefined;
  }

  try {
    const credentials = await secretsManager.getSecretJson<SqsCredentials>(settings.secretSqsCredentialsName);
    const service = new SqsQueueService(
      credentials,
      settings.awsEndpointUrl,
      settings.sqsQueueName,
      settings.sqsDlqName,
      settings.sqsMaxReceiveCount,
    );
    const { queueUrl } = await service.ensureInfrastructure();
    return { service, queueUrl };
  } catch (error) {
    console.warn('Could not initialize the shipment notification SQS queue.', error);
    return undefined;
  }
}

async function bootstrap(): Promise<void> {
  const settings = new Settings();
  const secretsManager = new SecretsManagerService(settings);

  const dbConnectionString = await resolveDbConnectionString(settings, secretsManager);
  const pool = await createPool(dbConnectionString);
  const storageService = await resolveStorageService(settings, secretsManager);
  const emailService = await resolveEmailService(settings, secretsManager);
  const notificationQueue = await resolveNotificationQueue(settings, secretsManager);

  const { controllers, worker } = buildControllers(
    pool,
    settings,
    storageService,
    emailService,
    notificationQueue?.service,
    notificationQueue?.queueUrl,
  );
  const app = createApp(settings, controllers);

  if (pool) {
    await controllers.commonController.warmCatalogCache().catch((error: unknown) => {
      console.warn('Could not warm the catalog cache.', error);
    });

    worker.start();
  }

  app.listen(settings.port, () => {
    console.log(`shopCart API listening on port ${settings.port}`);
  });
}

bootstrap();
