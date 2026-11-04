import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, authService } from '@services';
import type {
  CreateCuponRequest,
  CreateProductRequest,
  CreateProductTypeRequest,
  PresignedFileRequestItem,
  UpdateCuponRequest,
  UpdateProductRequest,
  UpdateProductTypeRequest,
} from '@services';
import type { CreateAccountWithRoleRequest } from '@services';
import { commonKeys } from '@hooks';
import { adminKeys } from './admin.keys';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductRequest) => adminService.createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commonKeys.products() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductRequest) => adminService.updateProduct(payload),
    onSuccess: (_void, variables) => {
      void queryClient.invalidateQueries({ queryKey: commonKeys.products() });
      void queryClient.invalidateQueries({ queryKey: adminKeys.productDetail(variables.idProduct) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idProduct: number) => adminService.deleteProduct(idProduct),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commonKeys.products() });
    },
  });
}

export function useGeneratePresignedUrls() {
  return useMutation({
    mutationFn: (files: PresignedFileRequestItem[]) => adminService.generatePresignedUrls(files),
  });
}

export function useCreateCupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCuponRequest) => adminService.createCupon(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.cupones() });
    },
  });
}

export function useUpdateCupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idCupon, payload }: { idCupon: number; payload: UpdateCuponRequest }) =>
      adminService.updateCupon(idCupon, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.cupones() });
    },
  });
}

export function useDeleteCupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idCupon: number) => adminService.deleteCupon(idCupon),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.cupones() });
    },
  });
}

export function useCreateProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductTypeRequest) => adminService.createProductType(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.productTypes() });
      void queryClient.invalidateQueries({ queryKey: commonKeys.catalog() });
    },
  });
}

export function useUpdateProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idProductType, payload }: { idProductType: number; payload: UpdateProductTypeRequest }) =>
      adminService.updateProductType(idProductType, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.productTypes() });
      void queryClient.invalidateQueries({ queryKey: commonKeys.catalog() });
      void queryClient.invalidateQueries({ queryKey: commonKeys.products() });
    },
  });
}

export function useDeleteProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idProductType: number) => adminService.deleteProductType(idProductType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.productTypes() });
      void queryClient.invalidateQueries({ queryKey: commonKeys.catalog() });
    },
  });
}

export function useInactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idUser: number) => adminService.inactivateUser(idUser),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}

export function useCreateUserWithRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountWithRoleRequest) => authService.createAccountWithRole(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}
