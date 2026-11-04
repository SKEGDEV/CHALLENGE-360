import { PaginatedResult, PaginationQuery } from './Common';

export interface PhotoDTO {
  fileName: string;
  s3BucketKey: string;
  fileContentType: string;
}

export interface VariantDTO {
  sku: string;
  size: string | null;
  color: string | null;
  features: string | null;
  price: number;
  quantity: number;
  isDefault: boolean;
  photos: PhotoDTO[];
}

export interface CreateProductRequest {
  idProductType: number;
  productName: string;
  productDescription: string;
  productPublicCode: string;
  variants: VariantDTO[];
}

export interface UpdatePhotoDTO {
  idFile?: number;
  fileName: string;
  s3BucketKey: string;
  fileContentType: string;
}

export interface UpdateVariantDTO {
  idVariant?: number;
  sku: string;
  size: string | null;
  color: string | null;
  features: string | null;
  price: number;
  quantity: number;
  isDefault: boolean;
  photos: UpdatePhotoDTO[];
}

export interface UpdateProductRequest {
  idProduct: number;
  idProductType: number;
  productName: string;
  productDescription: string;
  variants: UpdateVariantDTO[];
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

export interface ProductDetailResponse {
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

export interface PresignedFileRequest {
  files: PresignedFileRequestItem[];
}

export interface PresignedUrlDTO {
  fileName: string;
  fileKey: string;
  filePresignedUrl: string;
}

export interface PresignedFileResponseData {
  filesUrl: PresignedUrlDTO[];
  expiration: Date;
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
  cuponExpiration: Date;
  isPerCategory: boolean;
}

export interface CuponDetail extends CuponListItem {
  categoryIds: number[];
}

export type CuponListQuery = PaginationQuery;
export type CuponListResponseData = PaginatedResult<CuponListItem>;

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
  userBirthday: Date;
  idUserStatus: number;
  rolePublicCode: string;
}

export interface AdminUserListQuery extends PaginationQuery {
  search?: string;
  idUserStatus?: number;
}

export type AdminUserListResponseData = PaginatedResult<AdminUserListItem>;
