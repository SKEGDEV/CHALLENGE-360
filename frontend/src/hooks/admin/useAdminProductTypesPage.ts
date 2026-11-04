import { useState } from 'react';
import { ApiError } from '@core';
import type { ProductTypeItem } from '@services';
import { useAdminProductTypesQuery } from './admin.queries';
import { useCreateProductType, useDeleteProductType, useUpdateProductType } from './admin.mutations';

export interface ProductTypeFormValue {
  productTypeName: string;
  productTypeDescription: string;
}

function emptyForm(): ProductTypeFormValue {
  return { productTypeName: '', productTypeDescription: '' };
}

export function useAdminProductTypesPage() {
  const { data, isPending, isError, error, refetch } = useAdminProductTypesQuery();

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductTypeFormValue>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createProductType = useCreateProductType();
  const updateProductType = useUpdateProductType();
  const deleteProductType = useDeleteProductType();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFieldErrors({});
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (item: ProductTypeItem) => {
    setEditingId(item.idProductType);
    setForm({ productTypeName: item.productTypeName, productTypeDescription: item.productTypeDescription });
    setFieldErrors({});
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);
  const updateForm = (patch: Partial<ProductTypeFormValue>) => setForm((prev) => ({ ...prev, ...patch }));

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.productTypeName.trim()) errors.productTypeName = 'Ingresa el nombre de la categoria.';
    if (!form.productTypeDescription.trim()) errors.productTypeDescription = 'Ingresa una descripcion.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const submit = () => {
    setFormError(null);
    if (!validate()) return;

    const payload = { productTypeName: form.productTypeName.trim(), productTypeDescription: form.productTypeDescription.trim() };
    const callbacks = {
      onSuccess: () => setFormOpen(false),
      onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la categoria.'),
    };

    if (editingId) {
      updateProductType.mutate({ idProductType: editingId, payload }, callbacks);
    } else {
      createProductType.mutate(payload, callbacks);
    }
  };

  return {
    productTypes: data ?? [],
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
    isFormOpen,
    isEditing: editingId !== null,
    form,
    fieldErrors,
    formError,
    openCreate,
    openEdit,
    closeForm,
    updateForm,
    submit,
    isSaving: createProductType.isPending || updateProductType.isPending,
    deleteProductType,
  };
}
