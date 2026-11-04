import type { PaginatedResult, PaginationQuery } from '@core';

export interface PreOrderItemInput {
  idProductVariant: number;
  quantity: number;
}

export interface CreatePreOrderRequest {
  idShippmentMethod: number;
  addressLine1: string;
  addressLine2?: string | null;
  items: PreOrderItemInput[];
}

export interface CreatePreOrderResult {
  idInvoice: number;
  invoiceNumber: string;
}

export interface ConfirmShipmentRequest {
  cuponCode?: string | null;
}

export interface InvoiceTotals {
  subtotal: number;
  shippingPrice: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface ConfirmShipmentResult extends InvoiceTotals {
  idInvoice: number;
  invoiceNumber: string;
}

export interface InvoiceItemDetail {
  idProductVariant: number;
  sku: string;
  productName: string;
  quantity: number;
  priceShiped: number;
  lineTotal: number;
  isReversed: boolean;
}

export interface InvoiceListItem extends InvoiceTotals {
  idInvoice: number;
  invoiceNumber: string;
  documentNumber: string;
  invoiceDate: string;
  idShipmentStatus: number;
  shipmentStatusName: string;
  shippmentGuide: string | null;
  cuponCode: string | null;
}

export interface InvoiceListQuery extends PaginationQuery {
  idShipmentStatus?: number;
  from?: string;
  to?: string;
}

export type InvoiceListResult = PaginatedResult<InvoiceListItem>;

export interface InvoiceDetail extends InvoiceListItem {
  addressLine1: string;
  addressLine2: string | null;
  idShippmentMethod: number;
  shippmentMethodName: string;
  isPayVDelivered: boolean;
  items: InvoiceItemDetail[];
}
