import { IClientHelper, ICommonHelper } from '@Core';

export class ClientHelper implements IClientHelper {
  constructor(private readonly commonHelper: ICommonHelper) {}
}
