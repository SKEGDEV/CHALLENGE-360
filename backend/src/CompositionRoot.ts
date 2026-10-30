import { ConnectionPool } from 'mssql';
import { ISettings } from '@Core';
import {
  AuthRepository,
  ClientRepository,
  OperatorRepository,
  AdminRepository,
} from '@Infrastructure';
import {
  CommonHelper,
  AuthHelper,
  ClientHelper,
  OperatorHelper,
  AdminHelper,
  AuthService,
  ClientService,
  OperatorService,
  AdminService,
} from '@Application';
import {
  AuthController,
  ClientController,
  OperatorController,
  AdminController,
} from '@Presentation';
import { Controllers } from './app';

export function buildControllers(pool: ConnectionPool | undefined, settings: ISettings): Controllers {
  const commonHelper = new CommonHelper();

  const authService = new AuthService(
    new AuthRepository(pool),
    new AuthHelper(commonHelper, settings),
    commonHelper,
  );
  const clientService = new ClientService(new ClientRepository(pool), new ClientHelper(commonHelper));
  const operatorService = new OperatorService(new OperatorRepository(pool), new OperatorHelper(commonHelper));
  const adminService = new AdminService(new AdminRepository(pool), new AdminHelper(commonHelper));

  return {
    authController: new AuthController(authService),
    clientController: new ClientController(clientService),
    operatorController: new OperatorController(operatorService),
    adminController: new AdminController(adminService),
  };
}
