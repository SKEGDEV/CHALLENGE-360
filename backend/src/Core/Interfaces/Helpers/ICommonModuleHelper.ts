import { CatalogResponseData, ProductListResponseData } from '../../DTOs';
import { CatalogSnapshot, ProductSearchResult } from '../Repositories/ICommonRepository';
import { StoredFileContent } from '../Services/IStorageService';

export interface ICommonModuleHelper {
  setCatalogSnapshot(snapshot: CatalogSnapshot): void;
  isCatalogCacheWarm(): boolean;
  getCatalogForRoles(roles: string[]): CatalogResponseData;
  buildProductListResponse(
    pageNumber: number,
    pageSize: number,
    result: ProductSearchResult,
  ): ProductListResponseData;
  buildFileResponse(content: StoredFileContent | null, requestedContentType: string): StoredFileContent;
}
