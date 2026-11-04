import { queryOptions, useQuery } from '@tanstack/react-query';
import { clientService } from '@services';
import type { InvoiceListQuery } from '@services';
import { clientKeys } from './client.keys';

export const clientQueries = {
  invoiceList: (params?: InvoiceListQuery) =>
    queryOptions({
      queryKey: clientKeys.invoiceList(params),
      queryFn: ({ signal }) => clientService.listInvoices(params, signal),
    }),
  invoiceDetail: (idInvoice: number) =>
    queryOptions({
      queryKey: clientKeys.invoiceDetail(idInvoice),
      queryFn: ({ signal }) => clientService.getInvoiceDetail(idInvoice, signal),
    }),
};

export const useInvoiceListQuery = (params?: InvoiceListQuery) => useQuery(clientQueries.invoiceList(params));
export const useInvoiceDetailQuery = (idInvoice: number) => useQuery(clientQueries.invoiceDetail(idInvoice));
