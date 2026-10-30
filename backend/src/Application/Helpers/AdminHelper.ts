import { IAdminHelper, ICommonHelper } from '@Core';

export class AdminHelper implements IAdminHelper {
  constructor(private readonly commonHelper: ICommonHelper) {}
}
