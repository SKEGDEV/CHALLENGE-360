import { ICommonModuleHelper, ICommonHelper } from '@Core';

export class CommonModuleHelper implements ICommonModuleHelper {
  constructor(private readonly commonHelper: ICommonHelper) {}
}
