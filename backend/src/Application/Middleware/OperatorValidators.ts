import { AdjustInventoryRequest, UpdateShipmentStatusRequest } from '@Core';
import { FieldErrors } from './ValidationMiddleware';

export function validateAdjustInventoryRequest(data: AdjustInventoryRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!Array.isArray(data?.inventory) || data.inventory.length === 0) {
    errors.inventory = 'Debe incluir al menos un movimiento de inventario';
    return errors;
  }

  data.inventory.forEach((item, index) => {
    if (!item?.idProductVariant || !String(item.idProductVariant).trim()) {
      errors[`inventory[${index}].idProductVariant`] = 'El SKU de la variante es requerido';
    }
    const quantity = Number(item?.quantityToAdd);
    if (!quantity || quantity <= 0) {
      errors[`inventory[${index}].quantityToAdd`] = 'La cantidad debe ser mayor a cero';
    }
    if (item?.type !== 'sumar' && item?.type !== 'restar') {
      errors[`inventory[${index}].type`] = "El tipo debe ser 'sumar' o 'restar'";
    }
  });

  return errors;
}

export function validateUpdateShipmentStatusRequest(data: UpdateShipmentStatusRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!data?.invoiceNumber?.trim()) {
    errors.invoiceNumber = 'El numero de factura es requerido';
  }

  return errors;
}
