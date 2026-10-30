import { Router } from 'express';
import { IAdminService } from '@Core';

export class AdminController {
  public readonly router: Router;

  constructor(private readonly adminService: IAdminService) {
    this.router = Router();
  }
}
