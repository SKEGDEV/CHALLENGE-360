import {
  CreateAccountRequest,
  CreateAccountResponseData,
  CustomException,
  ErrorDictionary,
  IAuthHelper,
  IAuthRepository,
  IAuthService,
  ICommonHelper,
  LoginRequest,
  LoginResponseData,
  SessionValidationOutcome,
  StandardResponse,
  SuccessDictionary,
} from '@Core';

export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly authHelper: IAuthHelper,
    private readonly commonHelper: ICommonHelper,
  ) {}

  async createAccount(
    data: CreateAccountRequest,
    rolePublicCode: string,
  ): Promise<StandardResponse<CreateAccountResponseData>> {
    const validationErrors = this.authHelper.validateCreateAccountRequest(data);
    if (validationErrors.length > 0) {
      throw new CustomException(400, 'VAL0001', validationErrors.join('|'));
    }

    const userPasswordHash = await this.authHelper.hashPassword(data.userPassword);

    const created = await this.authRepository
      .createAccount({
        userFirstName: data.userFirstName,
        userLastName: data.userLastName,
        userPasswordHash,
        userEmail: data.userEmail,
        userBirthday: new Date(data.userBirthday),
        rolePublicCode,
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('EMAIL_ALREADY_EXISTS')) {
          throw new CustomException(409, 'AUTH0008', ErrorDictionary.AUTH0008);
        }
        if (message.includes('ROLE_NOT_FOUND')) {
          throw new CustomException(400, 'AUTH0009', ErrorDictionary.AUTH0009);
        }
        throw error;
      });

    return this.commonHelper.buildResponse(200, created, SuccessDictionary.OK0001);
  }

  async login(data: LoginRequest): Promise<StandardResponse<LoginResponseData>> {
    const validationErrors = this.authHelper.validateLoginRequest(data);
    if (validationErrors.length > 0) {
      throw new CustomException(400, 'VAL0001', validationErrors.join('|'));
    }

    const user = await this.authRepository.getUserByEmail(data.userEmail);
    if (!user) {
      throw new CustomException(401, 'AUTH0001', ErrorDictionary.AUTH0001);
    }

    const isPasswordValid = await this.authHelper.verifyPassword(data.userPassword, user.userPassword);
    if (!isPasswordValid) {
      throw new CustomException(401, 'AUTH0001', ErrorDictionary.AUTH0001);
    }

    const roles = await this.authRepository.getRolesByUserId(user.idUser);
    const tokens = this.authHelper.generateTokens(user.idUser, roles);

    await this.authRepository.upsertSession(user.idUser, tokens.refreshToken, tokens.refreshTokenExpire);

    return this.commonHelper.buildResponse(
      200,
      { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      SuccessDictionary.OK0002,
    );
  }

  async validateSession(
    accessToken: string | undefined,
    refreshToken: string | undefined,
  ): Promise<SessionValidationOutcome> {
    if (!accessToken) {
      return { success: false, statusCode: 403, errorCode: 'AUTH0004', errorMessage: ErrorDictionary.AUTH0004 };
    }

    const verification = this.authHelper.verifyAccessToken(accessToken);
    if (!verification.isValid || !verification.payload) {
      return { success: false, statusCode: 403, errorCode: 'AUTH0004', errorMessage: ErrorDictionary.AUTH0004 };
    }

    if (!verification.isExpired) {
      return {
        success: true,
        statusCode: 200,
        successCode: 'OK0003',
        idUser: verification.payload.idUser,
        roles: verification.payload.roles,
      };
    }

    if (!refreshToken) {
      return { success: false, statusCode: 403, errorCode: 'AUTH0005', errorMessage: ErrorDictionary.AUTH0005 };
    }

    const session = await this.authRepository.getSessionByRefreshToken(refreshToken);
    if (!session || !session.sessionIsActive) {
      return { success: false, statusCode: 403, errorCode: 'AUTH0005', errorMessage: ErrorDictionary.AUTH0005 };
    }

    if (session.sessionRefreshTokenExpire.getTime() <= Date.now()) {
      return { success: false, statusCode: 403, errorCode: 'AUTH0006', errorMessage: ErrorDictionary.AUTH0006 };
    }

    const rotated = this.authHelper.rotateAccessToken(verification.payload.idUser, verification.payload.roles);
    await this.authRepository.rotateRefreshToken(refreshToken, rotated.refreshToken);

    return {
      success: true,
      statusCode: 200,
      successCode: 'OK0002',
      idUser: verification.payload.idUser,
      roles: verification.payload.roles,
      refreshSession: { accessToken: rotated.accessToken, refreshToken: rotated.refreshToken },
    };
  }

  async validateRolePermission(roles: string[], resourcePath: string): Promise<boolean> {
    return this.authRepository.validateRolePermission(roles, resourcePath);
  }
}
