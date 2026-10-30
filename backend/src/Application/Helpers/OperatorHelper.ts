import { IOperatorHelper, ICommonHelper } from '@Core';

export class OperatorHelper implements IOperatorHelper {
  constructor(private readonly commonHelper: ICommonHelper) {}
}
