import { Router } from 'express';
import { IOperatorService } from '@Core';

export class OperatorController {
  public readonly router: Router;

  constructor(private readonly operatorService: IOperatorService) {
    this.router = Router();
  }
}
