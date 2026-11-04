import { http, unwrapData, type StandardResponse } from '@core';
import type {
  CreateAccountRequest,
  CreateAccountResult,
  CreateAccountWithRoleRequest,
  LoginRequest,
  LoginResult,
} from './auth.types';

export const authService = {
  createAccount: async (payload: CreateAccountRequest): Promise<CreateAccountResult> =>
    unwrapData(await http.post<StandardResponse<CreateAccountResult>>('/api/auth/account', payload)),

  createAccountWithRole: async (payload: CreateAccountWithRoleRequest): Promise<CreateAccountResult> =>
    unwrapData(await http.post<StandardResponse<CreateAccountResult>>('/api/auth/account/privado', payload)),

  login: async (payload: LoginRequest): Promise<LoginResult> =>
    unwrapData(await http.post<StandardResponse<LoginResult>>('/api/auth/login', payload)),
};
