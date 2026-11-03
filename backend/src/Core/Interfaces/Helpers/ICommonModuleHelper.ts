import {
  CatalogResponseData,
  DashboardResponseData,
  ProductListResponseData,
  ShipmentNotificationCacheEntry,
} from '../../DTOs';
import { CatalogSnapshot, DashboardRawResult, ProductSearchResult } from '../Repositories/ICommonRepository';
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

  cacheShipmentNotification(entry: ShipmentNotificationCacheEntry): void;
  getRecentShipmentNotifications(limit?: number): ShipmentNotificationCacheEntry[];
  buildDashboardResponse(raw: DashboardRawResult): DashboardResponseData;
}
