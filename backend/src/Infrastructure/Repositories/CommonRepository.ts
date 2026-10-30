import { ConnectionPool } from 'mssql';
import { ICommonRepository } from '@Core';

export class CommonRepository implements ICommonRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}
}
