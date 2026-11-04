import type { PaginatedResult, PaginationQuery } from '@core';

export interface ProductListQuery extends PaginationQuery {
  idProductType?: number;
  productName?: string;
  priceFrom?: number;
  priceTo?: number;
  from?: string;
  to?: string;
}

export interface ProductVariant {
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

export interface Product {
  idProduct: number;
  idProductType: number;
  productTypeName: string;
  productName: string;
  productDescription: string;
  productPublicCode: string;
  variants: ProductVariant[];
}

export type ProductListResult = PaginatedResult<Product>;

export interface CatalogEntry {
  id: number | string;
  name: string;
  description: string;
}

export type CatalogResult = Record<string, CatalogEntry[]>;

export interface DashboardVariantItem {
  idProduct: number;
  productName: string;
  idVariant: number;
  sku: string;
  totalQuantityShipped: number;
}

export interface DashboardCategoryItem {
  idProductType: number;
  productTypeName: string;
  totalQuantitySold: number;
}

export interface DashboardShipmentNotification {
  invoiceNumber: string;
  statusName: string;
  toEmail: string;
  notifiedAt: string;
}

export interface Dashboard {
  mostShippedVariants: DashboardVariantItem[];
  leastShippedVariants: DashboardVariantItem[];
  topCategories: DashboardCategoryItem[];
  recentShipmentNotifications: DashboardShipmentNotification[];
}
