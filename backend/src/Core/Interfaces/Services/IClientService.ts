import {
  AddPreOrderItemRequest,
  ConfirmShipmentRequest,
  ConfirmShipmentResponseData,
  CreatePreOrderRequest,
  CreatePreOrderResponseData,
  InvoiceDetailResponse,
  InvoiceListQuery,
  InvoiceListResponseData,
  StandardResponse,
} from '../../DTOs';

export interface IClientService {
  createPreOrder(idUser: number, data: CreatePreOrderRequest): Promise<StandardResponse<CreatePreOrderResponseData>>;
  addPreOrderItem(idUser: number, idInvoice: number, data: AddPreOrderItemRequest): Promise<StandardResponse<null>>;
  confirmShipment(
    idUser: number,
    idInvoice: number,
    data: ConfirmShipmentRequest,
  ): Promise<StandardResponse<ConfirmShipmentResponseData>>;
  getInvoices(idUser: number, query: InvoiceListQuery): Promise<StandardResponse<InvoiceListResponseData>>;
  getInvoiceDetail(idUser: number, idInvoice: number): Promise<StandardResponse<InvoiceDetailResponse>>;
  releaseExpiredPreOrders(): Promise<number>;
}
