import {
  CreateAccountRequest,
  CreateAccountResponseData,
  LoginRequest,
  LoginResponseData,
  SessionValidationOutcome,
} from '../../DTOs/Auth';
import { StandardResponse } from '../../DTOs/StandardResponse';

export interface IAuthService {
  createAccount(
    data: CreateAccountRequest,
    rolePublicCode: string,
  ): Promise<StandardResponse<CreateAccountResponseData>>;
  login(data: LoginRequest): Promise<StandardResponse<LoginResponseData>>;
  validateSession(
    accessToken: string | undefined,
    refreshToken: string | undefined,
  ): Promise<SessionValidationOutcome>;
  validateRolePermission(roles: string[], resourcePath: string): Promise<boolean>;
}
