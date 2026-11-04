import { queryOptions, useQuery } from '@tanstack/react-query';
import { operatorService } from '@services';
import type { ShipmentListQuery } from '@services';
import { operatorKeys } from './operator.keys';

export const operatorQueries = {
  shipmentList: (params?: ShipmentListQuery) =>
    queryOptions({
      queryKey: operatorKeys.shipmentList(params),
      queryFn: ({ signal }) => operatorService.getShipments(params, signal),
    }),
};

export const useShipmentListQuery = (params?: ShipmentListQuery) => useQuery(operatorQueries.shipmentList(params));
