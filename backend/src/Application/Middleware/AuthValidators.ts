import { CreateAccountRequest, CreateAccountWithRoleRequest, LoginRequest } from '@Core';
import { isValidEmail } from '../Helpers/CommonHelper';
import { FieldErrors } from './ValidationMiddleware';

const MIN_PASSWORD_LENGTH = 8;

export function validateCreateAccountRequest(data: CreateAccountRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!data?.userFirstName?.trim()) {
    errors.userFirstName = 'El nombre es requerido';
  }
  if (!data?.userLastName?.trim()) {
    errors.userLastName = 'El apellido es requerido';
  }
  if (!data?.userEmail || !isValidEmail(data.userEmail)) {
    errors.userEmail = 'El correo electronico no tiene un formato valido';
  }
  if (!data?.userPassword || data.userPassword.length < MIN_PASSWORD_LENGTH) {
    errors.userPassword = `La contrasenia debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }
  if (!data?.userBirthday || Number.isNaN(Date.parse(data.userBirthday))) {
    errors.userBirthday = 'La fecha de nacimiento no es valida';
  }

  return errors;
}

export function validateCreateAccountWithRoleRequest(data: CreateAccountWithRoleRequest): FieldErrors {
  const errors = validateCreateAccountRequest(data);

  if (!data?.rolePublicCode?.trim()) {
    errors.rolePublicCode = 'El rol es requerido';
  }

  return errors;
}

export function validateLoginRequest(data: LoginRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!data?.userEmail || !isValidEmail(data.userEmail)) {
    errors.userEmail = 'El correo electronico no tiene un formato valido';
  }
  if (!data?.userPassword) {
    errors.userPassword = 'La contrasenia es requerida';
  }

  return errors;
}
