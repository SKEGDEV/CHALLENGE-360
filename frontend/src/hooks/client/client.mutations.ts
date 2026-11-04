import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '@services';
import type { ConfirmShipmentRequest, CreatePreOrderRequest } from '@services';
import { clientKeys } from './client.keys';

export function useCreatePreOrder() {
  return useMutation({
    mutationFn: (payload: CreatePreOrderRequest) => clientService.createPreOrder(payload),
  });
}

export function useConfirmShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idInvoice, payload }: { idInvoice: number; payload: ConfirmShipmentRequest }) =>
      clientService.confirmShipment(idInvoice, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientKeys.invoices() });
    },
  });
}
