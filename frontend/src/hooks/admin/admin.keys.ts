import type { AdminUserListQuery, CuponListQuery } from '@services';

export const adminKeys = {
  all: ['admin'] as const,
  products: () => [...adminKeys.all, 'products'] as const,
  productDetail: (idProduct: number) => [...adminKeys.products(), 'detail', idProduct] as const,
  cupones: () => [...adminKeys.all, 'cupones'] as const,
  cuponList: (params?: CuponListQuery) => [...adminKeys.cupones(), params ?? {}] as const,
  cuponDetail: (idCupon: number) => [...adminKeys.cupones(), 'detail', idCupon] as const,
  productTypes: () => [...adminKeys.all, 'product-types'] as const,
  productTypeDetail: (idProductType: number) => [...adminKeys.productTypes(), 'detail', idProductType] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  userList: (params?: AdminUserListQuery) => [...adminKeys.users(), params ?? {}] as const,
};
