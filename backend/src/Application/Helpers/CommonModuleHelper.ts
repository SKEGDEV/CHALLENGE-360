import {
  CatalogResponseData,
  CatalogSnapshot,
  DashboardRawResult,
  DashboardResponseData,
  ICommonModuleHelper,
  ProductListItem,
  ProductListResponseData,
  ProductSearchResult,
  RawVariantRow,
  ShipmentNotificationCacheEntry,
  StoredFileContent,
} from '@Core';

const ROLE_CATALOG_MAP: Record<string, Array<keyof CatalogSnapshot>> = {
  ADPRU: ['CatProductType', 'CatCuponType', 'Role'],
  OPPRU: ['CatShippmentStatus'],
  RCPU: ['CatReverseReason', 'CatShippmentMethod'],
};

const MAX_CACHED_NOTIFICATIONS = 50;
const DEFAULT_RECENT_NOTIFICATIONS = 10;

export class CommonModuleHelper implements ICommonModuleHelper {
  private catalogSnapshot: CatalogSnapshot | null = null;
  private readonly shipmentNotificationCache: ShipmentNotificationCacheEntry[] = [];

  setCatalogSnapshot(snapshot: CatalogSnapshot): void {
    this.catalogSnapshot = snapshot;
  }

  isCatalogCacheWarm(): boolean {
    return this.catalogSnapshot !== null;
  }

  getCatalogForRoles(roles: string[]): CatalogResponseData {
    if (!this.catalogSnapshot) {
      throw new Error('Catalog cache has not been initialized');
    }

    const tableNames = new Set<keyof CatalogSnapshot>();
    for (const role of roles) {
      for (const tableName of ROLE_CATALOG_MAP[role] ?? []) {
        tableNames.add(tableName);
      }
    }

    const response: CatalogResponseData = {};
    for (const tableName of tableNames) {
      response[tableName] = this.catalogSnapshot[tableName];
    }

    return response;
  }

  buildProductListResponse(
    pageNumber: number,
    pageSize: number,
    result: ProductSearchResult,
  ): ProductListResponseData {
    const filesByVariant = new Map<number, string[]>();
    for (const file of result.files) {
      const list = filesByVariant.get(file.idProductVariant) ?? [];
      list.push(file.fileBucketKey);
      filesByVariant.set(file.idProductVariant, list);
    }

    const variantsByProduct = new Map<number, RawVariantRow[]>();
    for (const variant of result.variants) {
      const list = variantsByProduct.get(variant.idProduct) ?? [];
      list.push(variant);
      variantsByProduct.set(variant.idProduct, list);
    }

    const defaultVariantPhotosByProduct = new Map<number, string[]>();
    for (const [idProduct, variants] of variantsByProduct) {
      const defaultVariant = variants.find((variant) => variant.isDefault);
      if (defaultVariant) {
        defaultVariantPhotosByProduct.set(idProduct, filesByVariant.get(defaultVariant.idVariant) ?? []);
      }
    }

    const items: ProductListItem[] = result.products.map((product) => ({
      idProduct: product.idProduct,
      idProductType: product.idProductType,
      productName: product.productName,
      productDescription: product.productDescription,
      productPublicCode: product.productPublicCode,
      variants: (variantsByProduct.get(product.idProduct) ?? []).map((variant) => {
        const ownPhotos = filesByVariant.get(variant.idVariant) ?? [];
        const photos = ownPhotos.length > 0 ? ownPhotos : defaultVariantPhotosByProduct.get(product.idProduct) ?? [];

        return {
          idVariant: variant.idVariant,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          features: variant.features,
          price: variant.price,
          quantity: variant.quantity,
          isDefault: variant.isDefault,
          photos,
        };
      }),
    }));

    return {
      items,
      pageNumber,
      pageSize,
      totalCount: result.totalCount,
      totalPages: pageSize > 0 ? Math.ceil(result.totalCount / pageSize) : 0,
    };
  }

  buildFileResponse(content: StoredFileContent | null, requestedContentType: string): StoredFileContent {
    if (!content) {
      return { body: Buffer.alloc(0), contentType: requestedContentType };
    }
    return content;
  }

  cacheShipmentNotification(entry: ShipmentNotificationCacheEntry): void {
    this.shipmentNotificationCache.unshift(entry);
    this.shipmentNotificationCache.length = Math.min(
      this.shipmentNotificationCache.length,
      MAX_CACHED_NOTIFICATIONS,
    );
  }

  getRecentShipmentNotifications(limit: number = DEFAULT_RECENT_NOTIFICATIONS): ShipmentNotificationCacheEntry[] {
    return this.shipmentNotificationCache.slice(0, limit);
  }

  buildDashboardResponse(raw: DashboardRawResult): DashboardResponseData {
    return {
      mostShippedVariants: raw.mostShipped.map((row) => ({
        idProduct: row.idProduct,
        productName: row.productName,
        idVariant: row.idVariant,
        sku: row.sku,
        totalQuantityShipped: row.totalQuantity,
      })),
      leastShippedVariants: raw.leastShipped.map((row) => ({
        idProduct: row.idProduct,
        productName: row.productName,
        idVariant: row.idVariant,
        sku: row.sku,
        totalQuantityShipped: row.totalQuantity,
      })),
      topCategories: raw.topCategories.map((row) => ({
        idProductType: row.idProductType,
        productTypeName: row.productTypeName,
        totalQuantitySold: row.totalQuantity,
      })),
      recentShipmentNotifications: this.getRecentShipmentNotifications(),
    };
  }
}
