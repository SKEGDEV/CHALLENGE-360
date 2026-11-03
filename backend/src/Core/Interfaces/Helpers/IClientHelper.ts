import { InvoiceDetailResponse, InvoiceListItem, InvoiceTotals } from '../../DTOs';
import {
  RawCuponCategoryRow,
  RawInvoiceHeaderRow,
  RawInvoiceItemRow,
} from '../Repositories/IClientRepository';

export interface IClientHelper {
  computeInvoiceTotals(
    header: RawInvoiceHeaderRow,
    items: RawInvoiceItemRow[],
    cuponCategories: RawCuponCategoryRow[],
    taxPercentage: number,
  ): InvoiceTotals;

  mapInvoiceListItem(
    header: RawInvoiceHeaderRow,
    items: RawInvoiceItemRow[],
    cuponCategories: RawCuponCategoryRow[],
    taxPercentage: number,
  ): InvoiceListItem;

  mapInvoiceDetail(
    header: RawInvoiceHeaderRow,
    items: RawInvoiceItemRow[],
    cuponCategories: RawCuponCategoryRow[],
    taxPercentage: number,
  ): InvoiceDetailResponse;
}
