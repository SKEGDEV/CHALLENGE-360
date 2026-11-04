import type { InvoiceListQuery } from '@services';

export const clientKeys = {
  all: ['client'] as const,
  invoices: () => [...clientKeys.all, 'invoices'] as const,
  invoiceList: (params?: InvoiceListQuery) => [...clientKeys.invoices(), params ?? {}] as const,
  invoiceDetail: (idInvoice: number) => [...clientKeys.invoices(), 'detail', idInvoice] as const,
};
