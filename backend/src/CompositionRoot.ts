import { ConnectionPool } from 'mssql';
import { IEmailService, ISettings, ISqsQueueService, IStorageService } from '@Core';
import {
  AuthRepository,
  ClientRepository,
  OperatorRepository,
  AdminRepository,
  CommonRepository,
} from '@Infrastructure';
import {
  CommonHelper,
  AuthHelper,
  ClientHelper,
  OperatorHelper,
  AdminHelper,
  CommonModuleHelper,
  AuthService,
  ClientService,
  OperatorService,
  AdminService,
  CommonService,
  ShipmentWorker,
} from '@Application';
import {
  AuthController,
  ClientController,
  OperatorController,
  AdminController,
  CommonController,
} from '@Presentation';
import { Controllers } from './app';

export interface CompositionResult {
  controllers: Controllers;
  worker: ShipmentWorker;
}

export function buildControllers(
  pool: ConnectionPool | undefined,
  settings: ISettings,
  storageService: IStorageService | undefined,
  emailService: IEmailService | undefined,
  sqsQueueService: ISqsQueueService | undefined,
  notificationQueueUrl: string | undefined,
): CompositionResult {
  const commonHelper = new CommonHelper();
  const commonModuleHelper = new CommonModuleHelper();

  const authService = new AuthService(new AuthRepository(pool), new AuthHelper(settings), commonHelper);

  const clientService = new ClientService(new ClientRepository(pool), new ClientHelper(), commonHelper, settings);

  const operatorService = new OperatorService(
    new OperatorRepository(pool),
    new OperatorHelper(),
    commonHelper,
    sqsQueueService,
    notificationQueueUrl,
  );

  const commonService = new CommonService(
    new CommonRepository(pool),
    commonModuleHelper,
    commonHelper,
    storageService,
  );

  const adminService = new AdminService(
    new AdminRepository(pool),
    new AdminHelper(storageService),
    commonHelper,
    settings,
    commonService,
  );

  const worker = new ShipmentWorker(
    clientService,
    commonModuleHelper,
    settings,
    sqsQueueService,
    notificationQueueUrl,
    emailService,
  );

  const controllers: Controllers = {
    authController: new AuthController(authService),
    clientController: new ClientController(clientService, authService),
    operatorController: new OperatorController(operatorService, authService),
    adminController: new AdminController(adminService, authService),
    commonController: new CommonController(commonService, authService),
  };

  return { controllers, worker };
}
