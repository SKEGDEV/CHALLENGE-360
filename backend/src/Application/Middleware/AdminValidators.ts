import {
  CreateCuponRequest,
  CreateProductRequest,
  CreateProductTypeRequest,
  ErrorDictionary,
  PhotoDTO,
  PresignedFileRequest,
  UpdateCuponRequest,
  UpdatePhotoDTO,
  UpdateProductRequest,
  UpdateProductTypeRequest,
} from '@Core';
import { FieldErrors } from './ValidationMiddleware';

interface VariantLike {
  sku: string;
  price: number;
  quantity: number;
  isDefault: boolean;
  photos: PhotoDTO[] | UpdatePhotoDTO[];
}

function validateVariants(variants: VariantLike[] | undefined, errors: FieldErrors): void {
  if (!Array.isArray(variants) || variants.length === 0) {
    errors.variants = 'Debe incluir al menos una variante';
    return;
  }

  variants.forEach((variant, index) => {
    if (!variant?.sku?.trim()) {
      errors[`variants[${index}].sku`] = 'El SKU de la variante es requerido';
    }
    if (variant?.price === undefined || variant.price === null || variant.price < 0) {
      errors[`variants[${index}].price`] = 'El precio de la variante es requerido';
    }
    if (variant?.quantity === undefined || variant.quantity === null || variant.quantity < 0) {
      errors[`variants[${index}].quantity`] = 'La cantidad de la variante debe ser mayor o igual a cero';
    }

    if (!Array.isArray(variant?.photos)) {
      errors[`variants[${index}].photos`] = 'Las fotografias de la variante deben ser una lista';
    } else {
      variant.photos.forEach((photo, photoIndex) => {
        if (!photo?.fileName?.trim()) {
          errors[`variants[${index}].photos[${photoIndex}].fileName`] = 'El nombre del archivo es requerido';
        }
        if (!photo?.s3BucketKey?.trim()) {
          errors[`variants[${index}].photos[${photoIndex}].s3BucketKey`] = 'La llave del bucket S3 es requerida';
        }
        if (!photo?.fileContentType?.trim()) {
          errors[`variants[${index}].photos[${photoIndex}].fileContentType`] =
            'El tipo de contenido del archivo es requerido';
        }
      });
    }
  });

  const defaultCount = variants.filter((variant) => variant?.isDefault === true).length;
  if (defaultCount !== 1) {
    errors.isDefault = ErrorDictionary.VAL0002;
  }

  const hasPhotos = variants.some((variant) => Array.isArray(variant?.photos) && variant.photos.length > 0);
  if (!hasPhotos) {
    errors.photos = ErrorDictionary.VAL0003;
  }
}

export function validateCreateProductRequest(data: CreateProductRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!data?.productName?.trim()) {
    errors.productName = 'El nombre del producto es requerido';
  }
  if (!data?.productDescription?.trim()) {
    errors.productDescription = 'La descripcion del producto es requerida';
  }
  if (!data?.idProductType) {
    errors.idProductType = 'El tipo de producto es requerido';
  }
  if (!data?.productPublicCode?.trim()) {
    errors.productPublicCode = 'El codigo publico del producto es requerido';
  }

  validateVariants(data?.variants, errors);

  return errors;
}

export function validateUpdateProductRequest(data: UpdateProductRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!data?.idProduct) {
    errors.idProduct = 'El identificador del producto es requerido';
  }
  if (!data?.productName?.trim()) {
    errors.productName = 'El nombre del producto es requerido';
  }
  if (!data?.productDescription?.trim()) {
    errors.productDescription = 'La descripcion del producto es requerida';
  }
  if (!data?.idProductType) {
    errors.idProductType = 'El tipo de producto es requerido';
  }

  validateVariants(data?.variants, errors);

  return errors;
}

export function validatePresignedFileRequest(data: PresignedFileRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!Array.isArray(data?.files) || data.files.length === 0) {
    errors.files = 'Debe incluir al menos un archivo';
    return errors;
  }

  data.files.forEach((file, index) => {
    if (!file?.fileName?.trim()) {
      errors[`files[${index}].fileName`] = 'El nombre del archivo es requerido';
    }
    if (!file?.fileKey?.trim()) {
      errors[`files[${index}].fileKey`] = 'La llave del archivo es requerida';
    }
    if (!file?.fileContentType?.trim()) {
      errors[`files[${index}].fileContentType`] = 'El tipo de contenido del archivo es requerido';
    }
  });

  return errors;
}

export function validateCuponRequest(data: CreateCuponRequest | UpdateCuponRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!data?.idCuponType) {
    errors.idCuponType = 'El tipo de cupon es requerido';
  }
  if (!data?.cuponCode?.trim()) {
    errors.cuponCode = 'El codigo del cupon es requerido';
  }
  if (data?.limitUseTotal === undefined || data.limitUseTotal < 0) {
    errors.limitUseTotal = 'El limite de uso total debe ser mayor o igual a cero';
  }
  if (data?.limitUsePerClient === undefined || data.limitUsePerClient < 0) {
    errors.limitUsePerClient = 'El limite de uso por cliente debe ser mayor o igual a cero';
  }
  if (data?.cuponValue === undefined || data.cuponValue <= 0) {
    errors.cuponValue = 'El valor del cupon debe ser mayor a cero';
  }
  if (!data?.cuponExpiration || Number.isNaN(Date.parse(data.cuponExpiration))) {
    errors.cuponExpiration = 'La fecha de expiracion del cupon no es valida';
  }
  if (data?.isPerCategory && (!data.categoryIds || data.categoryIds.length === 0)) {
    errors.categoryIds = 'Debe indicar al menos una categoria cuando el cupon aplica por categoria';
  }

  return errors;
}

export function validateProductTypeRequest(data: CreateProductTypeRequest | UpdateProductTypeRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!data?.productTypeName?.trim()) {
    errors.productTypeName = 'El nombre del tipo de producto es requerido';
  }
  if (!data?.productTypeDescription?.trim()) {
    errors.productTypeDescription = 'La descripcion del tipo de producto es requerida';
  }

  return errors;
}
