import {
  CreateCuponRequest,
  CreateProductRequest,
  CreateProductTypeRequest,
  CuponDetail,
  CuponListQuery,
  CuponListResponseData,
  PresignedFileRequest,
  PresignedFileResponseData,
  ProductDetailResponse,
  ProductTypeItem,
  StandardResponse,
  UpdateCuponRequest,
  UpdateProductRequest,
  UpdateProductTypeRequest,
} from '../../DTOs';

export interface IAdminService {
  createProduct(data: CreateProductRequest, createdBy: number): Promise<StandardResponse<null>>;
  getProductDetail(idProduct: number): Promise<StandardResponse<ProductDetailResponse>>;
  updateProduct(data: UpdateProductRequest, updatedBy: number): Promise<StandardResponse<null>>;
  deleteProduct(idProduct: number, updatedBy: number): Promise<StandardResponse<null>>;

  generatePresignedUrls(data: PresignedFileRequest): Promise<StandardResponse<PresignedFileResponseData>>;

  inactivateUser(idUser: number): Promise<StandardResponse<null>>;

  createCupon(data: CreateCuponRequest, createdBy: number): Promise<StandardResponse<null>>;
  getCupones(query: CuponListQuery): Promise<StandardResponse<CuponListResponseData>>;
  getCuponById(idCupon: number): Promise<StandardResponse<CuponDetail>>;
  updateCupon(idCupon: number, data: UpdateCuponRequest, updatedBy: number): Promise<StandardResponse<null>>;
  deleteCupon(idCupon: number, updatedBy: number): Promise<StandardResponse<null>>;

  createProductType(data: CreateProductTypeRequest): Promise<StandardResponse<null>>;
  getProductTypes(): Promise<StandardResponse<ProductTypeItem[]>>;
  getProductTypeById(idProductType: number): Promise<StandardResponse<ProductTypeItem>>;
  updateProductType(idProductType: number, data: UpdateProductTypeRequest): Promise<StandardResponse<null>>;
  deleteProductType(idProductType: number): Promise<StandardResponse<null>>;
}
