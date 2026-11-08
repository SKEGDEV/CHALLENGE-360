import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ApiError } from '@core';
import { useCart } from '@store';
import { useConfirmShipment } from './client.mutations';

const PAYMENT_SIMULATION_MS = 1400;

function isValidCardNumber(value: string): boolean {
  return /^\d{16}$/.test(value.replace(/\s+/g, ''));
}

function isValidExpiry(value: string): boolean {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
}

export function useCheckoutPaymentPage(idInvoice: number) {
  const cart = useCart();
  const navigate = useNavigate();
  const confirmShipment = useConfirmShipment();

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cuponCode, setCuponCode] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const errors: Record<string, string> = {};
    if (!isValidCardNumber(cardNumber)) errors.cardNumber = 'Ingresa un número de tarjeta válido de 16 dígitos.';
    if (!cardName.trim()) errors.cardName = 'Ingresa el nombre tal como aparece en la tarjeta.';
    if (!isValidExpiry(expiry)) errors.expiry = 'Usa el formato MM/AA.';
    if (!/^\d{3,4}$/.test(cvv)) errors.cvv = 'El CVV debe tener 3 o 4 dígitos.';
    setCardErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      confirmShipment.mutate(
        { idInvoice, payload: { cuponCode: cuponCode.trim() || null } },
        {
          onSuccess: () => {
            cart.clear();
            void navigate({
              to: '/orders/$idInvoice',
              params: { idInvoice: String(idInvoice) },
              search: { success: true },
            });
          },
          onError: (error) => {
            setErrorMessage(error instanceof ApiError ? error.message : 'No se pudo confirmar el pedido.');
          },
        },
      );
    }, PAYMENT_SIMULATION_MS);
  };

  return {
    cardNumber,
    setCardNumber,
    cardName,
    setCardName,
    expiry,
    setExpiry,
    cvv,
    setCvv,
    cuponCode,
    setCuponCode,
    cardErrors,
    errorMessage,
    isProcessingPayment,
    isConfirming: confirmShipment.isPending,
    onSubmit,
  };
}
