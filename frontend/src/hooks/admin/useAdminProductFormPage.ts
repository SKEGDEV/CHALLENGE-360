import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ApiError, buildFileUrl, buildProductImageKey, generateSku, uploadFileToS3, validateProductImageFile } from '@core';
import { useCatalogQuery } from '@hooks';
import type { CatalogEntry, ProductDetail } from '@services';
import { useAdminProductDetailQuery } from './admin.queries';
import { useCreateProduct, useGeneratePresignedUrls, useUpdateProduct } from './admin.mutations';

export interface PhotoFormValue {
  idFile?: number;
  fileName: string;
  s3BucketKey: string;
  fileContentType: string;
  previewUrl: string;
}

export interface VariantFormValue {
  idVariant?: number;
  sku: string;
  size: string;
  color: string;
  features: string;
  price: string;
  quantity: string;
  isDefault: boolean;
  photos: PhotoFormValue[];
  uploadError: string | null;
  isUploading: boolean;
}

function emptyVariant(isDefault: boolean): VariantFormValue {
  return {
    sku: '',
    size: '',
    color: '',
    features: '',
    price: '',
    quantity: '',
    isDefault,
    photos: [],
    uploadError: null,
    isUploading: false,
  };
}

function variantsFromDetail(detail: ProductDetail): VariantFormValue[] {
  return detail.variants.map((variant) => ({
    idVariant: variant.idVariant,
    sku: variant.sku,
    size: variant.size ?? '',
    color: variant.color ?? '',
    features: variant.features ?? '',
    price: String(variant.price),
    quantity: String(variant.quantity),
    isDefault: variant.isDefault,
    uploadError: null,
    isUploading: false,
    photos: variant.photos.map((photo) => ({
      idFile: photo.idFile,
      fileName: photo.fileName,
      s3BucketKey: photo.fileBucketKey,
      fileContentType: photo.fileContentType,
      previewUrl: buildFileUrl(photo.fileBucketKey, photo.fileContentType),
    })),
  }));
}

export function useAdminProductFormData(idProduct: number | null) {
  const isEditMode = idProduct !== null;
  const { data: catalog } = useCatalogQuery();
  const { data: detail, isPending, isError } = useAdminProductDetailQuery(idProduct ?? 0);

  return {
    isEditMode,
    isLoadingDetail: isEditMode && isPending,
    isDetailError: isEditMode && isError,
    detail: isEditMode ? (detail ?? null) : null,
    productTypes: catalog?.CatProductType ?? ([] as CatalogEntry[]),
  };
}

export function useProductFormState(idProduct: number | null, detail: ProductDetail | null) {
  const isEditMode = idProduct !== null;
  const navigate = useNavigate();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const generatePresignedUrls = useGeneratePresignedUrls();

  const [idProductType, setIdProductType] = useState<number | null>(detail?.idProductType ?? null);
  const [productName, setProductName] = useState(detail?.productName ?? '');
  const [productDescription, setProductDescription] = useState(detail?.productDescription ?? '');
  const [productPublicCode, setProductPublicCode] = useState(detail?.productPublicCode ?? '');
  const [variants, setVariants] = useState<VariantFormValue[]>(() =>
    detail ? variantsFromDetail(detail) : [emptyVariant(true)],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateVariant = (index: number, patch: Partial<VariantFormValue>) => {
    setVariants((prev) => prev.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant(prev.length === 0)]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const setDefaultVariant = (index: number) => {
    setVariants((prev) => prev.map((variant, i) => ({ ...variant, isDefault: i === index })));
  };

  const autogenerateSku = (index: number) => {
    const variant = variants[index];
    if (!variant) return;
    updateVariant(index, { sku: generateSku(productPublicCode || productName, variant.color || null, variant.size || null) });
  };

  const addPhotos = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const variant = variants[index];
    if (!variant) return;
    if (!variant.sku.trim()) {
      updateVariant(index, { uploadError: 'Ingresa o autogenera el SKU antes de subir fotos.' });
      return;
    }

    updateVariant(index, { isUploading: true, uploadError: null });

    try {
      const fileList = Array.from(files);
      for (const file of fileList) {
        const validationError = validateProductImageFile(file);
        if (validationError) {
          updateVariant(index, { uploadError: validationError, isUploading: false });
          return;
        }
      }

      const fileKeys = fileList.map((file) => buildProductImageKey(variant.sku.trim(), file.name));
      const presigned = await generatePresignedUrls.mutateAsync(
        fileList.map((file, i) => ({ fileName: file.name, fileKey: fileKeys[i]!, fileContentType: file.type })),
      );

      await Promise.all(
        fileList.map((file, i) => {
          const match = presigned.filesUrl.find((entry) => entry.fileKey === fileKeys[i]);
          if (!match) throw new Error('No se recibió la URL prefirmada para una de las imágenes.');
          return uploadFileToS3(match.filePresignedUrl, file);
        }),
      );

      const newPhotos: PhotoFormValue[] = fileList.map((file, i) => ({
        fileName: file.name,
        s3BucketKey: fileKeys[i]!,
        fileContentType: file.type,
        previewUrl: URL.createObjectURL(file),
      }));

      setVariants((prev) =>
        prev.map((v, i) => (i === index ? { ...v, photos: [...v.photos, ...newPhotos], isUploading: false } : v)),
      );
    } catch (error) {
      updateVariant(index, {
        isUploading: false,
        uploadError: error instanceof Error ? error.message : 'No se pudieron subir las imágenes.',
      });
    }
  };

  const removePhoto = (variantIndex: number, photoIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex ? { ...variant, photos: variant.photos.filter((_, p) => p !== photoIndex) } : variant,
      ),
    );
  };

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!idProductType) errors.idProductType = 'Selecciona una categoría.';
    if (!productName.trim()) errors.productName = 'Ingresa el nombre del producto.';
    if (!productDescription.trim()) errors.productDescription = 'Ingresa una descripción.';
    if (!isEditMode && !productPublicCode.trim()) errors.productPublicCode = 'Ingresa el código público del producto.';
    if (variants.length === 0) errors.variants = 'Agrega al menos una variante.';

    variants.forEach((variant, index) => {
      if (!variant.sku.trim()) errors[`variant-${index}-sku`] = 'Ingresa o autogenera el SKU.';
      if (!variant.price.trim() || Number(variant.price) <= 0) errors[`variant-${index}-price`] = 'Ingresa un precio válido.';
      if (!variant.quantity.trim() || Number(variant.quantity) < 0)
        errors[`variant-${index}-quantity`] = 'Ingresa una cantidad válida.';
      if (variant.photos.length === 0) errors[`variant-${index}-photos`] = 'Sube al menos una fotografía.';
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const submit = () => {
    setFormError(null);
    if (!validate()) return;

    const variantPayload = variants.map((variant) => ({
      idVariant: variant.idVariant,
      sku: variant.sku.trim(),
      size: variant.size.trim() || null,
      color: variant.color.trim() || null,
      features: variant.features.trim() || null,
      price: Number(variant.price),
      quantity: Number(variant.quantity),
      isDefault: variant.isDefault,
      photos: variant.photos.map((photo) => ({
        idFile: photo.idFile,
        fileName: photo.fileName,
        s3BucketKey: photo.s3BucketKey,
        fileContentType: photo.fileContentType,
      })),
    }));

    const callbacks = {
      onSuccess: () => void navigate({ to: '/admin/products' }),
      onError: (error: unknown) => setFormError(error instanceof ApiError ? error.message : 'No se pudo guardar el producto.'),
    };

    if (isEditMode && idProduct !== null) {
      updateProduct.mutate(
        { idProduct, idProductType: idProductType!, productName, productDescription, variants: variantPayload },
        callbacks,
      );
    } else {
      createProduct.mutate(
        { idProductType: idProductType!, productName, productDescription, productPublicCode, variants: variantPayload },
        callbacks,
      );
    }
  };

  return {
    isEditMode,
    idProductType,
    setIdProductType,
    productName,
    setProductName,
    productDescription,
    setProductDescription,
    productPublicCode,
    setProductPublicCode,
    variants,
    updateVariant,
    addVariant,
    removeVariant,
    setDefaultVariant,
    autogenerateSku,
    addPhotos,
    removePhoto,
    fieldErrors,
    formError,
    isSaving: createProduct.isPending || updateProduct.isPending,
    submit,
  };
}
