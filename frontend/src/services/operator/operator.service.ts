import { http, unwrapData, type StandardResponse } from '@core';
import type { AdjustInventoryRequest, ShipmentListQuery, ShipmentListResult, UpdateShipmentStatusRequest } from './operator.types';

export const operatorService = {
  adjustInventory: async (payload: AdjustInventoryRequest): Promise<void> => {
    await http.patch<StandardResponse<null>>('/api/operator/inventory', payload);
  },

  updateShipmentStatus: async (payload: UpdateShipmentStatusRequest): Promise<void> => {
    await http.patch<StandardResponse<null>>('/api/operator/shippment-status', payload);
  },

  getShipments: async (params?: ShipmentListQuery, signal?: AbortSignal): Promise<ShipmentListResult> =>
    unwrapData(
      await http.get<StandardResponse<ShipmentListResult>>('/api/operator/shippment', {
        params: params as Record<string, string | number | boolean | undefined>,
        signal,
      }),
    ),
};
