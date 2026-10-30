import { Router } from 'express';
import { IClientService } from '@Core';

export class ClientController {
  public readonly router: Router;

  constructor(private readonly clientService: IClientService) {
    this.router = Router();
  }
}
