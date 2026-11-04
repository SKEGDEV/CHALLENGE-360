import { useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorService } from '@services';
import type { AdjustInventoryRequest, UpdateShipmentStatusRequest } from '@services';
import { commonKeys } from '@hooks';
import { operatorKeys } from './operator.keys';

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdjustInventoryRequest) => operatorService.adjustInventory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commonKeys.products() });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateShipmentStatusRequest) => operatorService.updateShipmentStatus(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: operatorKeys.shipments() });
    },
  });
}
