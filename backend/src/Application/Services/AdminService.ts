import { IAdminService, IAdminRepository, IAdminHelper } from '@Core';

export class AdminService implements IAdminService {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly adminHelper: IAdminHelper,
  ) {}
}
