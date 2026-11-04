import { useState } from 'react';
import { ApiError } from '@core';
import { useCatalogQuery } from '@hooks';
import { useAdminUserListQuery } from './admin.queries';
import { useCreateUserWithRole, useInactivateUser } from './admin.mutations';

const ADMIN_PAGE_SIZE = 20;

export const USER_STATUS_OPTIONS = [
  { id: 1, label: 'Activo' },
  { id: 2, label: 'Inactivo' },
  { id: 3, label: 'Bloqueado' },
] as const;

export function userStatusLabel(idUserStatus: number): string {
  return USER_STATUS_OPTIONS.find((option) => option.id === idUserStatus)?.label ?? `Estado ${idUserStatus}`;
}

export interface CreateUserFormValue {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPassword: string;
  userBirthday: string;
  rolePublicCode: string;
}

function emptyForm(): CreateUserFormValue {
  return { userFirstName: '', userLastName: '', userEmail: '', userPassword: '', userBirthday: '', rolePublicCode: '' };
}

export function useAdminUsersPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState('');
  const [idUserStatus, setIdUserStatus] = useState<number | null>(null);

  const { data, isPending, isError, error, refetch } = useAdminUserListQuery({
    pageNumber,
    pageSize: ADMIN_PAGE_SIZE,
    search: search.trim() || undefined,
    idUserStatus: idUserStatus ?? undefined,
  });

  const { data: catalog } = useCatalogQuery();
  const roles = catalog?.Role ?? [];

  const inactivateUser = useInactivateUser();
  const createUser = useCreateUserWithRole();

  const [isFormOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CreateUserFormValue>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setForm(emptyForm());
    setFieldErrors({});
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);
  const updateForm = (patch: Partial<CreateUserFormValue>) => setForm((prev) => ({ ...prev, ...patch }));

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.userFirstName.trim()) errors.userFirstName = 'Ingresa el nombre.';
    if (!form.userLastName.trim()) errors.userLastName = 'Ingresa el apellido.';
    if (!/^\S+@\S+\.\S+$/.test(form.userEmail)) errors.userEmail = 'Ingresa un correo valido.';
    if (form.userPassword.length < 8) errors.userPassword = 'La contrasena debe tener al menos 8 caracteres.';
    if (!form.userBirthday) errors.userBirthday = 'Selecciona la fecha de nacimiento.';
    if (!form.rolePublicCode) errors.rolePublicCode = 'Selecciona un rol.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const submit = () => {
    setFormError(null);
    if (!validate()) return;

    createUser.mutate(
      {
        userFirstName: form.userFirstName.trim(),
        userLastName: form.userLastName.trim(),
        userEmail: form.userEmail.trim(),
        userPassword: form.userPassword,
        userBirthday: form.userBirthday,
        rolePublicCode: form.rolePublicCode,
      },
      {
        onSuccess: () => setFormOpen(false),
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'No se pudo crear el usuario.'),
      },
    );
  };

  return {
    users: data?.items ?? [],
    pageNumber,
    totalPages: data?.totalPages ?? 1,
    setPageNumber,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPageNumber(1);
    },
    idUserStatus,
    setIdUserStatus: (value: number | null) => {
      setIdUserStatus(value);
      setPageNumber(1);
    },
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
    inactivateUser,
    roles,
    isFormOpen,
    form,
    fieldErrors,
    formError,
    openCreate,
    closeForm,
    updateForm,
    submit,
    isSaving: createUser.isPending,
  };
}
