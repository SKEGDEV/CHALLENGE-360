import type { PaginatedResult, PaginationQuery } from '@core';

export interface InventoryAdjustmentItem {
  idProductVariant: string;
  quantityToAdd: number;
  type: 'sumar' | 'restar';
}

export interface AdjustInventoryRequest {
  inventory: InventoryAdjustmentItem[];
}

export interface UpdateShipmentStatusRequest {
  invoiceNumber: string;
  deliveryGuide?: string;
}

export interface ShipmentListQuery extends PaginationQuery {
  from?: string;
  to?: string;
  idShipmentStatus?: number;
  idShippmentMethod?: number;
}

export interface ShipmentListItem {
  idInvoice: number;
  invoiceNumber: string;
  documentNumber: string;
  idUser: number;
  addressLine1: string;
  addressLine2: string | null;
  invoiceDate: string;
  idShipmentStatus: number;
  shipmentStatusName: string;
  idShippmentMethod: number;
  shippmentMethodName: string;
  shippmentGuide: string | null;
  isPayVDelivered: boolean;
}

export type ShipmentListResult = PaginatedResult<ShipmentListItem>;
