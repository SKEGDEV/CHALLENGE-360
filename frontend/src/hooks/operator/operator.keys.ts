import type { ShipmentListQuery } from '@services';

export const operatorKeys = {
  all: ['operator'] as const,
  shipments: () => [...operatorKeys.all, 'shipments'] as const,
  shipmentList: (params?: ShipmentListQuery) => [...operatorKeys.shipments(), params ?? {}] as const,
};
