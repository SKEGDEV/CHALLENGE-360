import { CreateAccountRequest, JwtPayload, LoginRequest } from '../../DTOs/Auth';

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpire: Date;
}

export interface RotatedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload: JwtPayload | null;
}

export interface IAuthHelper {
  validateCreateAccountRequest(data: CreateAccountRequest): string[];
  validateLoginRequest(data: LoginRequest): string[];
  hashPassword(plainPassword: string): Promise<string>;
  verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean>;
  generateTokens(idUser: number, roles: string[]): GeneratedTokens;
  rotateAccessToken(idUser: number, roles: string[]): RotatedTokens;
  verifyAccessToken(accessToken: string): AccessTokenValidationResult;
}
