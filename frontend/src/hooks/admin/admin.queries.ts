import { queryOptions, useQuery } from '@tanstack/react-query';
import { adminService } from '@services';
import type { AdminUserListQuery, CuponListQuery } from '@services';
import { adminKeys } from './admin.keys';

export const adminQueries = {
  productDetail: (idProduct: number) =>
    queryOptions({
      queryKey: adminKeys.productDetail(idProduct),
      queryFn: ({ signal }) => adminService.getProductDetail(idProduct, signal),
      enabled: idProduct > 0,
    }),
  cuponList: (params?: CuponListQuery) =>
    queryOptions({
      queryKey: adminKeys.cuponList(params),
      queryFn: ({ signal }) => adminService.getCupones(params, signal),
    }),
  cuponDetail: (idCupon: number) =>
    queryOptions({
      queryKey: adminKeys.cuponDetail(idCupon),
      queryFn: ({ signal }) => adminService.getCuponById(idCupon, signal),
      enabled: idCupon > 0,
    }),
  productTypes: () =>
    queryOptions({
      queryKey: adminKeys.productTypes(),
      queryFn: ({ signal }) => adminService.getProductTypes(signal),
    }),
  userList: (params?: AdminUserListQuery) =>
    queryOptions({
      queryKey: adminKeys.userList(params),
      queryFn: ({ signal }) => adminService.getUsers(params, signal),
    }),
};

export const useAdminProductDetailQuery = (idProduct: number) => useQuery(adminQueries.productDetail(idProduct));
export const useAdminCuponListQuery = (params?: CuponListQuery) => useQuery(adminQueries.cuponList(params));
export const useAdminCuponDetailQuery = (idCupon: number) => useQuery(adminQueries.cuponDetail(idCupon));
export const useAdminProductTypesQuery = () => useQuery(adminQueries.productTypes());
export const useAdminUserListQuery = (params?: AdminUserListQuery) => useQuery(adminQueries.userList(params));
