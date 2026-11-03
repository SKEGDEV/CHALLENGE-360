import { PreOrderItemDTO } from '../../DTOs';

export interface RawInvoiceHeaderRow {
  idInvoice: number;
  invoiceNumber: string;
  documentNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  invoiceDate: Date;
  idShipmentStatus: number;
  shipmentStatusName: string;
  idShippmentMethod: number;
  shippmentMethodName: string;
  shippingPrice: number;
  shippmentGuide: string | null;
  isPayVDelivered: boolean;
  idCuponApplied: number | null;
  cuponCode: string | null;
  cuponTypeName: string | null;
  cuponValue: number | null;
  cuponIsPerCategory: boolean | null;
}

export interface RawInvoiceItemRow {
  idInvoice: number;
  idProductVariant: number;
  sku: string;
  productName: string;
  idProductType: number;
  quantity: number;
  priceShiped: number;
  isReversed: boolean;
}

export interface RawCuponCategoryRow {
  idCupon: number;
  idProductType: number;
}

export interface InvoiceListRawResult {
  headers: RawInvoiceHeaderRow[];
  items: RawInvoiceItemRow[];
  cuponCategories: RawCuponCategoryRow[];
  totalCount: number;
}

export interface InvoiceDetailRawResult {
  header: RawInvoiceHeaderRow;
  items: RawInvoiceItemRow[];
  cuponCategories: RawCuponCategoryRow[];
}

export interface CreatePreOrderData {
  idShippmentMethod: number;
  addressLine1: string;
  addressLine2: string | null;
  items: PreOrderItemDTO[];
}

export interface InvoiceListFilters {
  idShipmentStatus?: number;
  from?: Date;
  to?: Date;
}

export interface IClientRepository {
  createPreOrder(idUser: number, data: CreatePreOrderData): Promise<{ idInvoice: number; invoiceNumber: string }>;
  addPreOrderItem(idInvoice: number, idUser: number, item: PreOrderItemDTO): Promise<void>;
  confirmShipment(idInvoice: number, idUser: number, cuponCode: string | null): Promise<void>;
  getInvoices(
    idUser: number,
    pageNumber: number,
    pageSize: number,
    filters: InvoiceListFilters,
  ): Promise<InvoiceListRawResult>;
  getInvoiceDetail(idInvoice: number, idUser: number): Promise<InvoiceDetailRawResult | null>;
  releaseExpiredPreOrders(expirationMinutes: number): Promise<number>;
}
