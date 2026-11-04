export interface CreateAccountRequest {
  userFirstName: string;
  userLastName: string;
  userPassword: string;
  userEmail: string;
  userBirthday: string;
}

export interface CreateAccountResult {
  idUser: number;
  rolePublicCode: string;
}

export interface CreateAccountWithRoleRequest extends CreateAccountRequest {
  rolePublicCode: string;
}

export interface LoginRequest {
  userEmail: string;
  userPassword: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

export interface JwtClaims {
  idUser: number;
  roles: string[];
}
