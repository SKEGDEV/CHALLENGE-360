import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ApiError } from '@core';
import { useCatalogQuery } from '@hooks';
import { useCart } from '@store';
import { useCreatePreOrder } from './client.mutations';

export function useCheckoutPage() {
  const cart = useCart();
  const catalogQuery = useCatalogQuery();
  const shipmentMethods = catalogQuery.data?.CatShippmentMethod ?? [];

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [idShippmentMethod, setIdShippmentMethod] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const createPreOrder = useCreatePreOrder();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!addressLine1.trim()) {
      setErrorMessage('La direccion es requerida.');
      return;
    }
    if (!idShippmentMethod) {
      setErrorMessage('Selecciona un metodo de envio.');
      return;
    }

    createPreOrder.mutate(
      {
        idShippmentMethod,
        addressLine1,
        addressLine2: addressLine2.trim() || null,
        items: cart.items.map((item) => ({ idProductVariant: item.idProductVariant, quantity: item.quantity })),
      },
      {
        onSuccess: ({ idInvoice }) => {
          void navigate({ to: '/checkout/payment', search: { idInvoice } });
        },
        onError: (error) => {
          setErrorMessage(error instanceof ApiError ? error.message : 'No se pudo crear la pre orden.');
        },
      },
    );
  };

  return {
    items: cart.items,
    subtotal: cart.subtotal,
    shipmentMethods,
    isLoadingShipmentMethods: catalogQuery.isPending,
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    idShippmentMethod,
    setIdShippmentMethod,
    errorMessage,
    isSubmitting: createPreOrder.isPending,
    onSubmit,
  };
}
