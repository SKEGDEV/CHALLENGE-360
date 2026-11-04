import { http, unwrapData, type StandardResponse } from '@core';
import type {
  AdminUserListQuery,
  AdminUserListResult,
  CreateCuponRequest,
  CreateProductRequest,
  CreateProductTypeRequest,
  CuponDetail,
  CuponListQuery,
  CuponListResult,
  PresignedFileRequestItem,
  PresignedFileResult,
  ProductDetail,
  ProductTypeItem,
  UpdateCuponRequest,
  UpdateProductRequest,
  UpdateProductTypeRequest,
} from './admin.types';

export const adminService = {
  createProduct: async (payload: CreateProductRequest): Promise<void> => {
    await http.post<StandardResponse<null>>('/api/admin/product', payload);
  },

  updateProduct: async (payload: UpdateProductRequest): Promise<void> => {
    await http.put<StandardResponse<null>>('/api/admin/product', payload);
  },

  getProductDetail: async (idProduct: number, signal?: AbortSignal): Promise<ProductDetail> =>
    unwrapData(await http.get<StandardResponse<ProductDetail>>(`/api/admin/product/${idProduct}`, { signal })),

  deleteProduct: async (idProduct: number): Promise<void> => {
    await http.delete<StandardResponse<null>>(`/api/admin/product/${idProduct}`);
  },

  generatePresignedUrls: async (files: PresignedFileRequestItem[]): Promise<PresignedFileResult> =>
    unwrapData(await http.post<StandardResponse<PresignedFileResult>>('/api/admin/stored-file', { files })),

  getUsers: async (params?: AdminUserListQuery, signal?: AbortSignal): Promise<AdminUserListResult> =>
    unwrapData(
      await http.get<StandardResponse<AdminUserListResult>>('/api/admin/user', {
        params: params as Record<string, string | number | boolean | undefined>,
        signal,
      }),
    ),

  inactivateUser: async (idUser: number): Promise<void> => {
    await http.put<StandardResponse<null>>(`/api/admin/user/${idUser}/inactivate`);
  },

  createCupon: async (payload: CreateCuponRequest): Promise<void> => {
    await http.post<StandardResponse<null>>('/api/admin/cupon', payload);
  },

  getCupones: async (params?: CuponListQuery, signal?: AbortSignal): Promise<CuponListResult> =>
    unwrapData(
      await http.get<StandardResponse<CuponListResult>>('/api/admin/cupon', {
        params: params as Record<string, string | number | boolean | undefined>,
        signal,
      }),
    ),

  getCuponById: async (idCupon: number, signal?: AbortSignal): Promise<CuponDetail> =>
    unwrapData(await http.get<StandardResponse<CuponDetail>>(`/api/admin/cupon/${idCupon}`, { signal })),

  updateCupon: async (idCupon: number, payload: UpdateCuponRequest): Promise<void> => {
    await http.put<StandardResponse<null>>(`/api/admin/cupon/${idCupon}`, payload);
  },

  deleteCupon: async (idCupon: number): Promise<void> => {
    await http.delete<StandardResponse<null>>(`/api/admin/cupon/${idCupon}`);
  },

  createProductType: async (payload: CreateProductTypeRequest): Promise<void> => {
    await http.post<StandardResponse<null>>('/api/admin/product-type', payload);
  },

  getProductTypes: async (signal?: AbortSignal): Promise<ProductTypeItem[]> =>
    unwrapData(await http.get<StandardResponse<ProductTypeItem[]>>('/api/admin/product-type', { signal })),

  getProductTypeById: async (idProductType: number, signal?: AbortSignal): Promise<ProductTypeItem> =>
    unwrapData(
      await http.get<StandardResponse<ProductTypeItem>>(`/api/admin/product-type/${idProductType}`, { signal }),
    ),

  updateProductType: async (idProductType: number, payload: UpdateProductTypeRequest): Promise<void> => {
    await http.put<StandardResponse<null>>(`/api/admin/product-type/${idProductType}`, payload);
  },

  deleteProductType: async (idProductType: number): Promise<void> => {
    await http.delete<StandardResponse<null>>(`/api/admin/product-type/${idProductType}`);
  },
};
