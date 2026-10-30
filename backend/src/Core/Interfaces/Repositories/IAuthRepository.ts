export interface AuthUserRecord {
  idUser: number;
  userFirstName: string;
  userLastName: string;
  userPassword: string;
  userEmail: string;
}

export interface AuthSessionRecord {
  idSession: number;
  idUser: number;
  sessionRefreshTokenExpire: Date;
  sessionIsActive: boolean;
}

export interface CreateAccountRecord {
  userFirstName: string;
  userLastName: string;
  userPasswordHash: string;
  userEmail: string;
  userBirthday: Date;
  rolePublicCode: string;
}

export interface CreateAccountRecordResult {
  idUser: number;
  rolePublicCode: string;
}

export interface IAuthRepository {
  createAccount(data: CreateAccountRecord): Promise<CreateAccountRecordResult>;
  getUserByEmail(userEmail: string): Promise<AuthUserRecord | null>;
  getRolesByUserId(idUser: number): Promise<string[]>;
  upsertSession(idUser: number, refreshToken: string, refreshTokenExpire: Date): Promise<void>;
  getSessionByRefreshToken(refreshToken: string): Promise<AuthSessionRecord | null>;
  rotateRefreshToken(currentRefreshToken: string, newRefreshToken: string): Promise<void>;
  validateRolePermission(rolePublicCodes: string[], resourcePath: string): Promise<boolean>;
}
