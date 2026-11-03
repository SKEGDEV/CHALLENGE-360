import { PaginatedResult, PaginationQuery } from './Common';

export interface PreOrderItemDTO {
  idProductVariant: number;
  quantity: number;
}

export interface CreatePreOrderRequest {
  idShippmentMethod: number;
  addressLine1: string;
  addressLine2?: string | null;
  items: PreOrderItemDTO[];
}

export interface CreatePreOrderResponseData {
  idInvoice: number;
  invoiceNumber: string;
}

export type AddPreOrderItemRequest = PreOrderItemDTO;

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

export interface ConfirmShipmentResponseData extends InvoiceTotals {
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
  invoiceDate: Date;
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

export type InvoiceListResponseData = PaginatedResult<InvoiceListItem>;

export interface InvoiceDetailResponse extends InvoiceListItem {
  addressLine1: string;
  addressLine2: string | null;
  idShippmentMethod: number;
  shippmentMethodName: string;
  isPayVDelivered: boolean;
  items: InvoiceItemDetail[];
}
