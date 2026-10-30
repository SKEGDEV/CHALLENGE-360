import { ConnectionPool } from 'mssql';
import {
  AuthSessionRecord,
  AuthUserRecord,
  CreateAccountRecord,
  CreateAccountRecordResult,
  IAuthRepository,
} from '@Core';

export class AuthRepository implements IAuthRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}

  private getPool(): ConnectionPool {
    if (!this.pool) {
      throw new Error('Database connection pool is not available');
    }
    return this.pool;
  }

  async createAccount(data: CreateAccountRecord): Promise<CreateAccountRecordResult> {
    const request = this.getPool().request();
    request.input('UserFirstName', data.userFirstName);
    request.input('UserLastName', data.userLastName);
    request.input('UserPasswordHash', data.userPasswordHash);
    request.input('UserEmail', data.userEmail);
    request.input('UserBirthday', data.userBirthday);
    request.input('RolePublicCode', data.rolePublicCode);

    const result = await request.execute('SP_Auth_CrearCuenta');
    const row = result.recordset[0];

    return { idUser: row.IDUser, rolePublicCode: row.RolePublicCode };
  }

  async getUserByEmail(userEmail: string): Promise<AuthUserRecord | null> {
    const request = this.getPool().request();
    request.input('UserEmail', userEmail);

    const result = await request.execute('SP_Auth_ObtenerUsuarioPorEmail');
    const row = result.recordset[0];
    if (!row) {
      return null;
    }

    return {
      idUser: row.IDUser,
      userFirstName: row.UserFirstName,
      userLastName: row.UserLastName,
      userPassword: row.UserPassword,
      userEmail: row.UserEmail,
    };
  }

  async getRolesByUserId(idUser: number): Promise<string[]> {
    const request = this.getPool().request();
    request.input('IDUser', idUser);

    const result = await request.execute('SP_Auth_ObtenerRolesPorUsuario');
    return result.recordset.map((row) => row.RolePublicCode as string);
  }

  async upsertSession(idUser: number, refreshToken: string, refreshTokenExpire: Date): Promise<void> {
    const request = this.getPool().request();
    request.input('IDUser', idUser);
    request.input('SessionRefreshToken', refreshToken);
    request.input('SessionRefreshTokenExpire', refreshTokenExpire);

    await request.execute('SP_Auth_UpsertSesion');
  }

  async getSessionByRefreshToken(refreshToken: string): Promise<AuthSessionRecord | null> {
    const request = this.getPool().request();
    request.input('SessionRefreshToken', refreshToken);

    const result = await request.execute('SP_Auth_ObtenerSesionPorToken');
    const row = result.recordset[0];
    if (!row) {
      return null;
    }

    return {
      idSession: row.IDSession,
      idUser: row.IDUser,
      sessionRefreshTokenExpire: new Date(row.SessionRefreshTokenExpire),
      sessionIsActive: Boolean(row.SessionIsActive),
    };
  }

  async rotateRefreshToken(currentRefreshToken: string, newRefreshToken: string): Promise<void> {
    const request = this.getPool().request();
    request.input('SessionRefreshTokenActual', currentRefreshToken);
    request.input('SessionRefreshTokenNuevo', newRefreshToken);

    await request.execute('SP_Auth_RenovarToken');
  }

  async validateRolePermission(rolePublicCodes: string[], resourcePath: string): Promise<boolean> {
    for (const rolePublicCode of rolePublicCodes) {
      const request = this.getPool().request();
      request.input('RolePublicCode', rolePublicCode);
      request.input('ResourcePath', resourcePath);

      const result = await request.execute('SP_Auth_ValidarPermisoRol');
      const count = Number(result.recordset[0]?.PermisoCount ?? 0);
      if (count > 0) {
        return true;
      }
    }

    return false;
  }
}
