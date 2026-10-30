import { ConnectionPool } from 'mssql';
import { IOperatorRepository } from '@Core';

export class OperatorRepository implements IOperatorRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}
}
