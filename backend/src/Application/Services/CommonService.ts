import { ICommonService, ICommonRepository, ICommonModuleHelper } from '@Core';

export class CommonService implements ICommonService {
  constructor(
    private readonly commonRepository: ICommonRepository,
    private readonly commonModuleHelper: ICommonModuleHelper,
  ) {}
}
