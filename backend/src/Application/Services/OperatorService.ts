import { IOperatorService, IOperatorRepository, IOperatorHelper } from '@Core';

export class OperatorService implements IOperatorService {
  constructor(
    private readonly operatorRepository: IOperatorRepository,
    private readonly operatorHelper: IOperatorHelper,
  ) {}
}
