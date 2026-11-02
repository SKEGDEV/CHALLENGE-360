export interface PaginationQuery {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CatDTO {
  id: number | string;
  name: string;
  description: string;
}

export type CatalogResponseData = Record<string, CatDTO[]>;

export interface ProductListQuery extends PaginationQuery {
  idProductType?: number;
  productName?: string;
  priceFrom?: number;
  priceTo?: number;
  from?: string;
  to?: string;
}

export interface ProductListVariant {
  idVariant: number;
  sku: string;
  size: string | null;
  color: string | null;
  features: string | null;
  price: number;
  quantity: number;
  isDefault: boolean;
  photos: string[];
}

export interface ProductListItem {
  idProduct: number;
  idProductType: number;
  productName: string;
  productDescription: string;
  productPublicCode: string;
  variants: ProductListVariant[];
}

export type ProductListResponseData = PaginatedResult<ProductListItem>;
