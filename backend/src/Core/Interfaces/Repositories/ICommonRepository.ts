import { CatDTO } from '../../DTOs';

export interface ProductSearchFilters {
  idProductType?: number;
  productName?: string;
  priceFrom?: number;
  priceTo?: number;
  from?: Date;
  to?: Date;
}

export interface RawProductRow {
  idProduct: number;
  idProductType: number;
  productTypeName: string;
  productName: string;
  productDescription: string;
  productPublicCode: string;
}

export interface RawVariantRow {
  idVariant: number;
  idProduct: number;
  sku: string;
  size: string | null;
  color: string | null;
  features: string | null;
  price: number;
  quantity: number;
  isDefault: boolean;
}

export interface RawFileRow {
  idProductVariant: number;
  fileBucketKey: string;
}

export interface ProductSearchResult {
  products: RawProductRow[];
  variants: RawVariantRow[];
  files: RawFileRow[];
  totalCount: number;
}

export interface CatalogSnapshot {
  CatProductType: CatDTO[];
  CatCuponType: CatDTO[];
  Role: CatDTO[];
  CatShippmentStatus: CatDTO[];
  CatShippmentMethod: CatDTO[];
  CatReverseReason: CatDTO[];
}

export interface DashboardVariantRow {
  idProduct: number;
  productName: string;
  idVariant: number;
  sku: string;
  totalQuantity: number;
}

export interface DashboardCategoryRow {
  idProductType: number;
  productTypeName: string;
  totalQuantity: number;
}

export interface DashboardRawResult {
  mostShipped: DashboardVariantRow[];
  leastShipped: DashboardVariantRow[];
  topCategories: DashboardCategoryRow[];
}

export interface ICommonRepository {
  searchProducts(
    pageNumber: number,
    pageSize: number,
    filters: ProductSearchFilters,
  ): Promise<ProductSearchResult>;
  getCatalogSnapshot(): Promise<CatalogSnapshot>;
  getDashboard(): Promise<DashboardRawResult>;
}
