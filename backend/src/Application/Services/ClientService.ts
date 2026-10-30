import { IClientService, IClientRepository, IClientHelper } from '@Core';

export class ClientService implements IClientService {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly clientHelper: IClientHelper,
  ) {}
}
