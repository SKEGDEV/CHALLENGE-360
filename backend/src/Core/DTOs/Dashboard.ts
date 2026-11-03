import { ShipmentNotificationCacheEntry } from './Notifications';

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

export interface DashboardResponseData {
  mostShippedVariants: DashboardVariantItem[];
  leastShippedVariants: DashboardVariantItem[];
  topCategories: DashboardCategoryItem[];
  recentShipmentNotifications: ShipmentNotificationCacheEntry[];
}
