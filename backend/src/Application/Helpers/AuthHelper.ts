import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { AccessTokenValidationResult, GeneratedTokens, IAuthHelper, ISettings, JwtPayload, RotatedTokens } from '@Core';

const REFRESH_TOKEN_BYTES = 48;

export class AuthHelper implements IAuthHelper {
  constructor(private readonly settings: ISettings) {}

  async hashPassword(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword, { type: argon2.argon2id });
  }

  async verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, plainPassword);
  }

  generateTokens(idUser: number, roles: string[]): GeneratedTokens {
    const payload: JwtPayload = { idUser, roles };
    const accessToken = jwt.sign(payload, this.settings.jwtSecret, {
      expiresIn: this.settings.jwtAccessTokenExpiresInSeconds,
    });
    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const refreshTokenExpire = new Date(
      Date.now() + this.settings.jwtRefreshTokenExpiresInSeconds * 1000,
    );

    return { accessToken, refreshToken, refreshTokenExpire };
  }

  rotateAccessToken(idUser: number, roles: string[]): RotatedTokens {
    const payload: JwtPayload = { idUser, roles };
    const accessToken = jwt.sign(payload, this.settings.jwtSecret, {
      expiresIn: this.settings.jwtAccessTokenExpiresInSeconds,
    });
    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');

    return { accessToken, refreshToken };
  }

  verifyAccessToken(accessToken: string): AccessTokenValidationResult {
    try {
      const payload = jwt.verify(accessToken, this.settings.jwtSecret) as JwtPayload;
      return { isValid: true, isExpired: false, payload };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const payload = jwt.decode(accessToken) as JwtPayload | null;
        return { isValid: true, isExpired: true, payload };
      }
      return { isValid: false, isExpired: false, payload: null };
    }
  }
}
