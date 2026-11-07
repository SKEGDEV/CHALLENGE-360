import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ApiError, decodeJwtPayload } from '@core';
import type { JwtClaims, LoginResult } from '@services';
import { useLogin } from './auth.mutations';

function homeRouteForSession(session: LoginResult): '/' | '/admin' | '/operator' {
  const roles = decodeJwtPayload<JwtClaims>(session.accessToken)?.roles ?? [];
  if (roles.includes('ADPRU')) return '/admin';
  if (roles.includes('OPPRU')) return '/operator';
  return '/';
}

export function useLoginPage() {
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useLogin();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!userEmail || !userPassword) {
      setErrorMessage('Escribe tu correo electronico y tu contrasenia.');
      return;
    }

    login.mutate(
      { userEmail, userPassword },
      {
        onSuccess: (session) => void navigate({ to: homeRouteForSession(session) }),
        onError: (error) => {
          setErrorMessage(error instanceof ApiError ? error.message : 'No se pudo iniciar sesion.');
        },
      },
    );
  };

  return {
    userEmail,
    setUserEmail,
    userPassword,
    setUserPassword,
    errorMessage,
    isSubmitting: login.isPending,
    onSubmit,
  };
}
