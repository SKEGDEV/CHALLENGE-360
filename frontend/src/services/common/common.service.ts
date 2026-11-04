import { http, unwrapData, type StandardResponse } from '@core';
import type { CatalogResult, Dashboard, ProductListQuery, ProductListResult } from './common.types';

export const commonService = {
  listProducts: async (params?: ProductListQuery, signal?: AbortSignal): Promise<ProductListResult> =>
    unwrapData(
      await http.get<StandardResponse<ProductListResult>>('/api/common/product', {
        params: params as Record<string, string | number | boolean | undefined>,
        signal,
      }),
    ),

  getCatalog: async (signal?: AbortSignal): Promise<CatalogResult> =>
    unwrapData(await http.get<StandardResponse<CatalogResult>>('/api/common/catalog', { signal })),

  getDashboard: async (signal?: AbortSignal): Promise<Dashboard> =>
    unwrapData(await http.get<StandardResponse<Dashboard>>('/api/common/dashboard', { signal })),
};
