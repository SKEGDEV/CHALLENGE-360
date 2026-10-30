import 'express-async-errors';
import express, { Express } from 'express';
import { ISettings } from '@Core';
import { buildCorsMiddleware, errorHandlerMiddleware } from '@Application';
import {
  setupSwagger,
  AuthController,
  ClientController,
  OperatorController,
  AdminController,
} from '@Presentation';

export interface Controllers {
  authController: AuthController;
  clientController: ClientController;
  operatorController: OperatorController;
  adminController: AdminController;
}

export function createApp(settings: ISettings, controllers: Controllers): Express {
  const app = express();

  app.use(express.json());
  app.use(buildCorsMiddleware(settings));

  setupSwagger(app, settings);

  app.use('/api/auth', controllers.authController.router);
  app.use('/api/client', controllers.clientController.router);
  app.use('/api/operator', controllers.operatorController.router);
  app.use('/api/admin', controllers.adminController.router);

  app.use(errorHandlerMiddleware);

  return app;
}
