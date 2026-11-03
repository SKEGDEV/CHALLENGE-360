import {
  CatalogResponseData,
  DashboardResponseData,
  ICommonHelper,
  ICommonModuleHelper,
  ICommonRepository,
  ICommonService,
  IStorageService,
  ProductListQuery,
  ProductListResponseData,
  StandardResponse,
  StoredFileContent,
  SuccessDictionary,
} from '@Core';

export class CommonService implements ICommonService {
  constructor(
    private readonly commonRepository: ICommonRepository,
    private readonly commonModuleHelper: ICommonModuleHelper,
    private readonly commonHelper: ICommonHelper,
    private readonly storageService: IStorageService | undefined,
  ) {}

  async warmCatalogCache(): Promise<void> {
    const snapshot = await this.commonRepository.getCatalogSnapshot();
    this.commonModuleHelper.setCatalogSnapshot(snapshot);
  }

  async getCatalog(roles: string[]): Promise<StandardResponse<CatalogResponseData>> {
    const data = this.commonModuleHelper.getCatalogForRoles(roles);
    return this.commonHelper.buildResponse(200, data, SuccessDictionary.OK0006);
  }

  async getProducts(query: ProductListQuery): Promise<StandardResponse<ProductListResponseData>> {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.commonRepository.searchProducts(pageNumber, pageSize, {
      idProductType: query.idProductType,
      productName: query.productName,
      priceFrom: query.priceFrom,
      priceTo: query.priceTo,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });

    const data = this.commonModuleHelper.buildProductListResponse(pageNumber, pageSize, result);
    return this.commonHelper.buildResponse(200, data, SuccessDictionary.OK0006);
  }

  async getFile(imageBucketKey: string, contentType: string): Promise<StoredFileContent> {
    if (!this.storageService) {
      return this.commonModuleHelper.buildFileResponse(null, contentType);
    }

    const content = await this.storageService.getFile(imageBucketKey);
    return this.commonModuleHelper.buildFileResponse(content, contentType);
  }

  async getDashboard(): Promise<StandardResponse<DashboardResponseData>> {
    const raw = await this.commonRepository.getDashboard();
    const data = this.commonModuleHelper.buildDashboardResponse(raw);
    return this.commonHelper.buildResponse(200, data, SuccessDictionary.OK0006);
  }
}
