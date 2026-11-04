import type { PaginatedResult, PaginationQuery } from '@core';

export interface AdminPhoto {
  idFile?: number;
  fileName: string;
  s3BucketKey: string;
  fileContentType: string;
}

export interface AdminVariantInput {
  idVariant?: number;
  sku: string;
  size: string | null;
  color: string | null;
  features: string | null;
  price: number;
  quantity: number;
  isDefault: boolean;
  photos: AdminPhoto[];
}

export interface CreateProductRequest {
  idProductType: number;
  productName: string;
  productDescription: string;
  productPublicCode: string;
  variants: AdminVariantInput[];
}

export interface UpdateProductRequest {
  idProduct: number;
  idProductType: number;
  productName: string;
  productDescription: string;
  variants: AdminVariantInput[];
}

export interface ProductDetailPhoto {
  idFile: number;
  fileName: string;
  fileBucketKey: string;
  fileContentType: string;
}

export interface ProductDetailVariant {
  idVariant: number;
  sku: string;
  size: string | null;
  color: string | null;
  features: string | null;
  price: number;
  quantity: number;
  isDefault: boolean;
  photos: ProductDetailPhoto[];
}

export interface ProductDetail {
  idProduct: number;
  idProductType: number;
  productName: string;
  productDescription: string;
  productPublicCode: string;
  variants: ProductDetailVariant[];
}

export interface PresignedFileRequestItem {
  fileName: string;
  fileKey: string;
  fileContentType: string;
}

export interface PresignedUrlResult {
  fileName: string;
  fileKey: string;
  filePresignedUrl: string;
}

export interface PresignedFileResult {
  filesUrl: PresignedUrlResult[];
  expiration: string;
}

export interface CreateCuponRequest {
  idCuponType: number;
  cuponCode: string;
  limitUseTotal: number;
  limitUsePerClient: number;
  cuponValue: number;
  cuponExpiration: string;
  isPerCategory: boolean;
  categoryIds?: number[];
}

export type UpdateCuponRequest = CreateCuponRequest;

export interface CuponListItem {
  idCupon: number;
  idCuponType: number;
  cuponCode: string;
  limitUseTotal: number;
  limitUsePerClient: number;
  cuponValue: number;
  cuponExpiration: string;
  isPerCategory: boolean;
}

export interface CuponDetail extends CuponListItem {
  categoryIds: number[];
}

export type CuponListQuery = PaginationQuery;
export type CuponListResult = PaginatedResult<CuponListItem>;

export interface CreateProductTypeRequest {
  productTypeName: string;
  productTypeDescription: string;
}

export type UpdateProductTypeRequest = CreateProductTypeRequest;

export interface ProductTypeItem {
  idProductType: number;
  productTypeName: string;
  productTypeDescription: string;
}

export interface AdminUserListItem {
  idUser: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userBirthday: string;
  idUserStatus: number;
  rolePublicCode: string;
}

export interface AdminUserListQuery extends PaginationQuery {
  search?: string;
  idUserStatus?: number;
}

export type AdminUserListResult = PaginatedResult<AdminUserListItem>;
