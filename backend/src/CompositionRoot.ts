import { ConnectionPool } from 'mssql';
import { ISettings, IStorageService } from '@Core';
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
} from '@Application';
import {
  AuthController,
  ClientController,
  OperatorController,
  AdminController,
  CommonController,
} from '@Presentation';
import { Controllers } from './app';

export function buildControllers(
  pool: ConnectionPool | undefined,
  settings: ISettings,
  storageService: IStorageService | undefined,
): Controllers {
  const commonHelper = new CommonHelper();

  const authService = new AuthService(
    new AuthRepository(pool),
    new AuthHelper(settings),
    commonHelper,
  );
  const clientService = new ClientService(new ClientRepository(pool), new ClientHelper(commonHelper));
  const operatorService = new OperatorService(new OperatorRepository(pool), new OperatorHelper(commonHelper));
  const commonService = new CommonService(
    new CommonRepository(pool),
    new CommonModuleHelper(),
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

  return {
    authController: new AuthController(authService),
    clientController: new ClientController(clientService),
    operatorController: new OperatorController(operatorService),
    adminController: new AdminController(adminService, authService),
    commonController: new CommonController(commonService, authService),
  };
}
