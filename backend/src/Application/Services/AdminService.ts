import {
  CreateCuponRequest,
  CreateProductRequest,
  CreateProductTypeRequest,
  CuponDetail,
  CuponListQuery,
  CuponListResponseData,
  CustomException,
  ErrorDictionary,
  IAdminHelper,
  IAdminRepository,
  IAdminService,
  ICommonHelper,
  ICommonService,
  ISettings,
  PresignedFileRequest,
  PresignedFileResponseData,
  ProductDetailResponse,
  ProductTypeItem,
  StandardResponse,
  SuccessDictionary,
  UpdateCuponRequest,
  UpdateProductRequest,
  UpdateProductTypeRequest,
} from '@Core';

export class AdminService implements IAdminService {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly adminHelper: IAdminHelper,
    private readonly commonHelper: ICommonHelper,
    private readonly settings: ISettings,
    private readonly commonService: ICommonService,
  ) {}

  async createProduct(data: CreateProductRequest, createdBy: number): Promise<StandardResponse<null>> {
    await this.adminRepository
      .createProduct(
        {
          idProductType: data.idProductType,
          productName: data.productName,
          productDescription: data.productDescription,
          productPublicCode: data.productPublicCode,
        },
        data.variants,
        createdBy,
      )
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('PRODUCT_PUBLIC_CODE_EXISTS')) {
          throw new CustomException(409, 'ADM0002', ErrorDictionary.ADM0002);
        }
        if (message.includes('SKU_ALREADY_EXISTS')) {
          throw new CustomException(409, 'ADM0003', ErrorDictionary.ADM0003);
        }
        throw error;
      });

    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0004);
  }

  async getProductDetail(idProduct: number): Promise<StandardResponse<ProductDetailResponse>> {
    const product = await this.adminRepository.getProductDetail(idProduct);
    if (!product) {
      throw new CustomException(404, 'ADM0001', ErrorDictionary.ADM0001);
    }
    return this.commonHelper.buildResponse(200, product, SuccessDictionary.OK0007);
  }

  async updateProduct(data: UpdateProductRequest, updatedBy: number): Promise<StandardResponse<null>> {
    const current = await this.adminRepository.getProductDetail(data.idProduct);
    if (!current) {
      throw new CustomException(404, 'ADM0001', ErrorDictionary.ADM0001);
    }

    const plan = this.adminHelper.planProductUpdate(current, data);

    await this.adminRepository
      .updateProduct(
        data.idProduct,
        {
          idProductType: data.idProductType,
          productName: data.productName,
          productDescription: data.productDescription,
          productPublicCode: current.productPublicCode,
        },
        plan,
        updatedBy,
      )
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('SKU_ALREADY_EXISTS')) {
          throw new CustomException(409, 'ADM0003', ErrorDictionary.ADM0003);
        }
        throw error;
      });

    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0008);
  }

  async deleteProduct(idProduct: number, updatedBy: number): Promise<StandardResponse<null>> {
    const current = await this.adminRepository.getProductDetail(idProduct);
    if (!current) {
      throw new CustomException(404, 'ADM0001', ErrorDictionary.ADM0001);
    }
    await this.adminRepository.deleteProduct(idProduct, updatedBy);
    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0009);
  }

  async generatePresignedUrls(
    data: PresignedFileRequest,
  ): Promise<StandardResponse<PresignedFileResponseData>> {
    const result = await this.adminHelper.buildPresignedUrls(data, this.settings.preSignedUrlExpirationSeconds);
    return this.commonHelper.buildResponse(200, result, SuccessDictionary.OK0005);
  }

  async inactivateUser(idUser: number): Promise<StandardResponse<null>> {
    await this.adminRepository.inactivateUser(idUser).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('USER_NOT_FOUND')) {
        throw new CustomException(404, 'ADM0007', ErrorDictionary.ADM0007);
      }
      throw error;
    });

    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0010);
  }

  async createCupon(data: CreateCuponRequest, createdBy: number): Promise<StandardResponse<null>> {
    await this.adminRepository.createCupon(data, createdBy).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('CUPON_CODE_EXISTS')) {
        throw new CustomException(409, 'ADM0005', ErrorDictionary.ADM0005);
      }
      throw error;
    });

    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0004);
  }

  async getCupones(query: CuponListQuery): Promise<StandardResponse<CuponListResponseData>> {
    const result = await this.adminRepository.getCupones(query);
    return this.commonHelper.buildResponse(200, result, SuccessDictionary.OK0006);
  }

  async getCuponById(idCupon: number): Promise<StandardResponse<CuponDetail>> {
    const cupon = await this.adminRepository.getCuponById(idCupon);
    if (!cupon) {
      throw new CustomException(404, 'ADM0004', ErrorDictionary.ADM0004);
    }
    return this.commonHelper.buildResponse(200, cupon, SuccessDictionary.OK0007);
  }

  async updateCupon(
    idCupon: number,
    data: UpdateCuponRequest,
    updatedBy: number,
  ): Promise<StandardResponse<null>> {
    const existing = await this.adminRepository.getCuponById(idCupon);
    if (!existing) {
      throw new CustomException(404, 'ADM0004', ErrorDictionary.ADM0004);
    }

    await this.adminRepository.updateCupon(idCupon, data, updatedBy).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('CUPON_CODE_EXISTS')) {
        throw new CustomException(409, 'ADM0005', ErrorDictionary.ADM0005);
      }
      throw error;
    });

    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0008);
  }

  async deleteCupon(idCupon: number, updatedBy: number): Promise<StandardResponse<null>> {
    const existing = await this.adminRepository.getCuponById(idCupon);
    if (!existing) {
      throw new CustomException(404, 'ADM0004', ErrorDictionary.ADM0004);
    }
    await this.adminRepository.deleteCupon(idCupon, updatedBy);
    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0009);
  }

  async createProductType(data: CreateProductTypeRequest): Promise<StandardResponse<null>> {
    await this.adminRepository.createProductType(data);
    await this.commonService.warmCatalogCache();
    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0004);
  }

  async getProductTypes(): Promise<StandardResponse<ProductTypeItem[]>> {
    const result = await this.adminRepository.getProductTypes();
    return this.commonHelper.buildResponse(200, result, SuccessDictionary.OK0006);
  }

  async getProductTypeById(idProductType: number): Promise<StandardResponse<ProductTypeItem>> {
    const result = await this.adminRepository.getProductTypeById(idProductType);
    if (!result) {
      throw new CustomException(404, 'ADM0006', ErrorDictionary.ADM0006);
    }
    return this.commonHelper.buildResponse(200, result, SuccessDictionary.OK0007);
  }

  async updateProductType(
    idProductType: number,
    data: UpdateProductTypeRequest,
  ): Promise<StandardResponse<null>> {
    const existing = await this.adminRepository.getProductTypeById(idProductType);
    if (!existing) {
      throw new CustomException(404, 'ADM0006', ErrorDictionary.ADM0006);
    }

    await this.adminRepository.updateProductType(idProductType, data);
    await this.commonService.warmCatalogCache();
    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0008);
  }

  async deleteProductType(idProductType: number): Promise<StandardResponse<null>> {
    const existing = await this.adminRepository.getProductTypeById(idProductType);
    if (!existing) {
      throw new CustomException(404, 'ADM0006', ErrorDictionary.ADM0006);
    }
    await this.adminRepository.deleteProductType(idProductType);
    await this.commonService.warmCatalogCache();
    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0009);
  }
}
