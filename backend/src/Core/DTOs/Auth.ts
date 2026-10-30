export interface CreateAccountRequest {
  userFirstName: string;
  userLastName: string;
  userPassword: string;
  userEmail: string;
  userBirthday: string;
}

export interface CreateAccountWithRoleRequest extends CreateAccountRequest {
  rolePublicCode: string;
}

export interface CreateAccountResponseData {
  idUser: number;
  rolePublicCode: string;
}

export interface LoginRequest {
  userEmail: string;
  userPassword: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshSessionData {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  idUser: number;
  roles: string[];
}

export interface SessionValidationOutcome {
  success: boolean;
  statusCode: number;
  successCode?: string;
  errorCode?: string;
  errorMessage?: string;
  idUser?: number;
  roles?: string[];
  refreshSession?: RefreshSessionData;
}
