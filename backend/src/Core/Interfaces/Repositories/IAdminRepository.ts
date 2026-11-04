import {
  AdminUserListItem,
  AdminUserListQuery,
  CreateCuponRequest,
  CuponDetail,
  CuponListItem,
  PaginatedResult,
  PaginationQuery,
  ProductDetailResponse,
  ProductTypeItem,
  UpdateCuponRequest,
  UpdatePhotoDTO,
  UpdateProductTypeRequest,
  VariantDTO,
} from '../../DTOs';

export interface ProductCoreData {
  idProductType: number;
  productName: string;
  productDescription: string;
  productPublicCode: string;
}

export interface VariantUpdatePlanItem {
  idVariant: number;
  sku: string;
  size: string | null;
  color: string | null;
  features: string | null;
  price: number;
  quantity: number;
  isDefault: boolean;
  newPhotos: UpdatePhotoDTO[];
}

export interface VariantCreatePlanItem {
  sku: string;
  size: string | null;
  color: string | null;
  features: string | null;
  price: number;
  quantity: number;
  isDefault: boolean;
  photos: UpdatePhotoDTO[];
}

export interface ProductUpdatePlan {
  variantsToUpdate: VariantUpdatePlanItem[];
  variantsToCreate: VariantCreatePlanItem[];
  variantIdsToDeactivate: number[];
  fileIdsToDelete: number[];
}

export interface IAdminRepository {
  createProduct(product: ProductCoreData, variants: VariantDTO[], createdBy: number): Promise<number>;
  getProductDetail(idProduct: number): Promise<ProductDetailResponse | null>;
  updateProduct(
    idProduct: number,
    product: ProductCoreData,
    plan: ProductUpdatePlan,
    updatedBy: number,
  ): Promise<void>;
  deleteProduct(idProduct: number, updatedBy: number): Promise<void>;

  getUsers(query: AdminUserListQuery): Promise<PaginatedResult<AdminUserListItem>>;
  inactivateUser(idUser: number): Promise<void>;

  createCupon(data: CreateCuponRequest, createdBy: number): Promise<number>;
  getCupones(query: PaginationQuery): Promise<PaginatedResult<CuponListItem>>;
  getCuponById(idCupon: number): Promise<CuponDetail | null>;
  updateCupon(idCupon: number, data: UpdateCuponRequest, updatedBy: number): Promise<void>;
  deleteCupon(idCupon: number, updatedBy: number): Promise<void>;

  createProductType(data: { productTypeName: string; productTypeDescription: string }): Promise<number>;
  getProductTypes(): Promise<ProductTypeItem[]>;
  getProductTypeById(idProductType: number): Promise<ProductTypeItem | null>;
  updateProductType(idProductType: number, data: UpdateProductTypeRequest): Promise<void>;
  deleteProductType(idProductType: number): Promise<void>;
}
