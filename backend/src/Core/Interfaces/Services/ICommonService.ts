import {
  CatalogResponseData,
  DashboardResponseData,
  ProductListQuery,
  ProductListResponseData,
  StandardResponse,
} from '../../DTOs';
import { StoredFileContent } from './IStorageService';

export interface ICommonService {
  warmCatalogCache(): Promise<void>;
  getCatalog(roles: string[]): Promise<StandardResponse<CatalogResponseData>>;
  getProducts(query: ProductListQuery): Promise<StandardResponse<ProductListResponseData>>;
  getFile(imageBucketKey: string, contentType: string): Promise<StoredFileContent>;
  getDashboard(): Promise<StandardResponse<DashboardResponseData>>;
}
