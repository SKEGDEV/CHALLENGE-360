import { queryOptions, useQuery } from '@tanstack/react-query';
import { commonService } from '@services';
import type { ProductListQuery } from '@services';
import { commonKeys } from './common.keys';

export const commonQueries = {
  productList: (params?: ProductListQuery) =>
    queryOptions({
      queryKey: commonKeys.productList(params),
      queryFn: ({ signal }) => commonService.listProducts(params, signal),
    }),
  catalog: () =>
    queryOptions({
      queryKey: commonKeys.catalog(),
      queryFn: ({ signal }) => commonService.getCatalog(signal),
    }),
  dashboard: () =>
    queryOptions({
      queryKey: commonKeys.dashboard(),
      queryFn: ({ signal }) => commonService.getDashboard(signal),
    }),
};

export const useProductListQuery = (params?: ProductListQuery) => useQuery(commonQueries.productList(params));
export const useCatalogQuery = (enabled = true) => useQuery({ ...commonQueries.catalog(), enabled });
export const useDashboardQuery = () => useQuery(commonQueries.dashboard());
