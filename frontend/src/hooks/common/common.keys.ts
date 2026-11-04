import type { ProductListQuery } from '@services';

export const HOME_PAGE_SIZE = 60;

export const commonKeys = {
  all: ['common'] as const,
  products: () => [...commonKeys.all, 'products'] as const,
  productList: (params?: ProductListQuery) => [...commonKeys.products(), params ?? {}] as const,
  catalog: () => [...commonKeys.all, 'catalog'] as const,
  dashboard: () => [...commonKeys.all, 'dashboard'] as const,
};
