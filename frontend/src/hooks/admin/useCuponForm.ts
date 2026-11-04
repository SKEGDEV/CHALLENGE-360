import { useState } from 'react';
import { ApiError } from '@core';
import type { CuponDetail } from '@services';
import { useCreateCupon, useUpdateCupon } from './admin.mutations';

export interface CuponFormValue {
  idCuponType: number | null;
  cuponCode: string;
  limitUseTotal: string;
  limitUsePerClient: string;
  cuponValue: string;
  cuponExpiration: string;
  isPerCategory: boolean;
  categoryIds: number[];
}

function emptyForm(): CuponFormValue {
  return {
    idCuponType: null,
    cuponCode: '',
    limitUseTotal: '',
    limitUsePerClient: '',
    cuponValue: '',
    cuponExpiration: '',
    isPerCategory: false,
    categoryIds: [],
  };
}

function formFromDetail(detail: CuponDetail): CuponFormValue {
  return {
    idCuponType: detail.idCuponType,
    cuponCode: detail.cuponCode,
    limitUseTotal: String(detail.limitUseTotal),
    limitUsePerClient: String(detail.limitUsePerClient),
    cuponValue: String(detail.cuponValue),
    cuponExpiration: new Date(detail.cuponExpiration).toISOString().slice(0, 16),
    isPerCategory: detail.isPerCategory,
    categoryIds: detail.categoryIds,
  };
}

export function useCuponForm(editingId: number | null, detail: CuponDetail | null, onSaved: () => void) {
  const [form, setForm] = useState<CuponFormValue>(() => (detail ? formFromDetail(detail) : emptyForm()));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createCupon = useCreateCupon();
  const updateCupon = useUpdateCupon();

  const updateForm = (patch: Partial<CuponFormValue>) => setForm((prev) => ({ ...prev, ...patch }));

  const toggleCategory = (idProductType: number) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(idProductType)
        ? prev.categoryIds.filter((id) => id !== idProductType)
        : [...prev.categoryIds, idProductType],
    }));
  };

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.idCuponType) errors.idCuponType = 'Selecciona un tipo de cupon.';
    if (!form.cuponCode.trim()) errors.cuponCode = 'Ingresa el codigo del cupon.';
    if (!form.limitUseTotal.trim() || Number(form.limitUseTotal) <= 0) errors.limitUseTotal = 'Ingresa un limite total valido.';
    if (!form.limitUsePerClient.trim() || Number(form.limitUsePerClient) <= 0)
      errors.limitUsePerClient = 'Ingresa un limite por cliente valido.';
    if (!form.cuponValue.trim() || Number(form.cuponValue) <= 0) errors.cuponValue = 'Ingresa un valor valido.';
    if (!form.cuponExpiration) errors.cuponExpiration = 'Selecciona la fecha de expiracion.';
    if (form.isPerCategory && form.categoryIds.length === 0) errors.categoryIds = 'Selecciona al menos una categoria.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const submit = () => {
    setFormError(null);
    if (!validate()) return;

    const payload = {
      idCuponType: form.idCuponType!,
      cuponCode: form.cuponCode.trim(),
      limitUseTotal: Number(form.limitUseTotal),
      limitUsePerClient: Number(form.limitUsePerClient),
      cuponValue: Number(form.cuponValue),
      cuponExpiration: new Date(form.cuponExpiration).toISOString(),
      isPerCategory: form.isPerCategory,
      categoryIds: form.isPerCategory ? form.categoryIds : undefined,
    };

    const callbacks = {
      onSuccess: onSaved,
      onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el cupon.'),
    };

    if (editingId) {
      updateCupon.mutate({ idCupon: editingId, payload }, callbacks);
    } else {
      createCupon.mutate(payload, callbacks);
    }
  };

  return {
    form,
    fieldErrors,
    formError,
    updateForm,
    toggleCategory,
    submit,
    isSaving: createCupon.isPending || updateCupon.isPending,
  };
}
