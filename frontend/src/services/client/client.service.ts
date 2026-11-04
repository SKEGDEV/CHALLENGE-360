import { http, unwrapData, type StandardResponse } from '@core';
import type {
  ConfirmShipmentRequest,
  ConfirmShipmentResult,
  CreatePreOrderRequest,
  CreatePreOrderResult,
  InvoiceDetail,
  InvoiceListQuery,
  InvoiceListResult,
  PreOrderItemInput,
} from './client.types';

export const clientService = {
  createPreOrder: async (payload: CreatePreOrderRequest): Promise<CreatePreOrderResult> =>
    unwrapData(await http.post<StandardResponse<CreatePreOrderResult>>('/api/client/pre-order', payload)),

  addPreOrderItem: async (idInvoice: number, payload: PreOrderItemInput): Promise<void> => {
    await http.post<StandardResponse<null>>(`/api/client/pre-order/${idInvoice}/item`, payload);
  },

  confirmShipment: async (idInvoice: number, payload: ConfirmShipmentRequest): Promise<ConfirmShipmentResult> =>
    unwrapData(
      await http.patch<StandardResponse<ConfirmShipmentResult>>(`/api/client/shippment/${idInvoice}`, payload),
    ),

  listInvoices: async (params?: InvoiceListQuery, signal?: AbortSignal): Promise<InvoiceListResult> =>
    unwrapData(
      await http.get<StandardResponse<InvoiceListResult>>('/api/client/invoice', {
        params: params as Record<string, string | number | boolean | undefined>,
        signal,
      }),
    ),

  getInvoiceDetail: async (idInvoice: number, signal?: AbortSignal): Promise<InvoiceDetail> =>
    unwrapData(await http.get<StandardResponse<InvoiceDetail>>(`/api/client/invoice/${idInvoice}`, { signal })),
};
