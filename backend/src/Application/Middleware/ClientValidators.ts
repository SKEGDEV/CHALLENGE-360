import { AddPreOrderItemRequest, ConfirmShipmentRequest, CreatePreOrderRequest } from '@Core';
import { FieldErrors } from './ValidationMiddleware';

function validateItem(item: { idProductVariant: number; quantity: number } | undefined, errors: FieldErrors, prefix: string): void {
  if (!item?.idProductVariant) {
    errors[`${prefix}.idProductVariant`] = 'El identificador de la variante es requerido';
  }
  if (!item?.quantity || item.quantity <= 0) {
    errors[`${prefix}.quantity`] = 'La cantidad debe ser mayor a cero';
  }
}

export function validateCreatePreOrderRequest(data: CreatePreOrderRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!data?.idShippmentMethod) {
    errors.idShippmentMethod = 'El metodo de envio es requerido';
  }
  if (!data?.addressLine1?.trim()) {
    errors.addressLine1 = 'La direccion es requerida';
  }
  if (!Array.isArray(data?.items) || data.items.length === 0) {
    errors.items = 'Debe incluir al menos un producto';
  } else {
    data.items.forEach((item, index) => validateItem(item, errors, `items[${index}]`));
  }

  return errors;
}

export function validateAddPreOrderItemRequest(data: AddPreOrderItemRequest): FieldErrors {
  const errors: FieldErrors = {};
  validateItem(data, errors, 'item');
  return errors;
}

export function validateConfirmShipmentRequest(data: ConfirmShipmentRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (data?.cuponCode !== undefined && data.cuponCode !== null && !data.cuponCode.trim()) {
    errors.cuponCode = 'El codigo de cupon no puede ser vacio';
  }

  return errors;
}
