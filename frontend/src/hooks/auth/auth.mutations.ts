import { useMutation } from '@tanstack/react-query';
import { decodeJwtPayload } from '@core';
import { authService } from '@services';
import type { CreateAccountRequest, JwtClaims, LoginRequest, LoginResult } from '@services';
import { useAuth } from '@store';

function applySession(auth: ReturnType<typeof useAuth>, session: LoginResult): void {
  const claims = decodeJwtPayload<JwtClaims>(session.accessToken);
  auth.login({
    idUser: claims?.idUser ?? 0,
    roles: claims?.roles ?? [],
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
}

export function useLogin() {
  const auth = useAuth();
  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (session) => applySession(auth, session),
  });
}

export function useRegister() {
  const auth = useAuth();
  return useMutation({
    mutationFn: async (payload: CreateAccountRequest) => {
      await authService.createAccount(payload);
      return authService.login({ userEmail: payload.userEmail, userPassword: payload.userPassword });
    },
    onSuccess: (session) => applySession(auth, session),
  });
}
