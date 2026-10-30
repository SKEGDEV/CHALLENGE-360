import { ConnectionPool } from 'mssql';
import { IAdminRepository } from '@Core';

export class AdminRepository implements IAdminRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}
}
