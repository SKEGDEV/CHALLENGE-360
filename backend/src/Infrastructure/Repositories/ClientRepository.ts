import { ConnectionPool } from 'mssql';
import { IClientRepository } from '@Core';

export class ClientRepository implements IClientRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}
}
