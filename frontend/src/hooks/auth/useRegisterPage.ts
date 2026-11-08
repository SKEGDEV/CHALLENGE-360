import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ApiError } from '@core';
import { useRegister } from './auth.mutations';

interface RegisterFormState {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userBirthday: string;
  userPassword: string;
  confirmPassword: string;
}

const EMPTY_FORM: RegisterFormState = {
  userFirstName: '',
  userLastName: '',
  userEmail: '',
  userBirthday: '',
  userPassword: '',
  confirmPassword: '',
};

export function useRegisterPage() {
  const [form, setForm] = useState<RegisterFormState>(EMPTY_FORM);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const register = useRegister();

  const setField = (field: keyof RegisterFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const passwordChecks = {
    length: form.userPassword.length >= 8,
    match: form.userPassword.length > 0 && form.userPassword === form.confirmPassword,
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!form.userFirstName.trim() || !form.userLastName.trim()) {
      setErrorMessage('Escribe tu nombre y tus apellidos.');
      return;
    }
    if (!passwordChecks.length) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!passwordChecks.match) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    if (!form.userBirthday) {
      setErrorMessage('Indica tu fecha de nacimiento.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Acepta las condiciones de uso para continuar.');
      return;
    }

    register.mutate(
      {
        userFirstName: form.userFirstName,
        userLastName: form.userLastName,
        userEmail: form.userEmail,
        userPassword: form.userPassword,
        userBirthday: form.userBirthday,
      },
      {
        onSuccess: () => void navigate({ to: '/' }),
        onError: (error) => {
          setErrorMessage(error instanceof ApiError ? error.message : 'No se pudo crear la cuenta.');
        },
      },
    );
  };

  return {
    form,
    setField,
    acceptedTerms,
    setAcceptedTerms,
    passwordChecks,
    errorMessage,
    isSubmitting: register.isPending,
    onSubmit,
  };
}
