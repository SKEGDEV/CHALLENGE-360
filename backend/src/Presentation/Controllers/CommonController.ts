import { Router } from 'express';
import { ICommonService } from '@Core';

export class CommonController {
  public readonly router: Router;

  constructor(private readonly commonService: ICommonService) {
    this.router = Router();
  }
}
