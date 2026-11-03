import {
  IClientHelper,
  InvoiceDetailResponse,
  InvoiceListItem,
  InvoiceTotals,
  RawCuponCategoryRow,
  RawInvoiceHeaderRow,
  RawInvoiceItemRow,
} from '@Core';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export class ClientHelper implements IClientHelper {
  computeInvoiceTotals(
    header: RawInvoiceHeaderRow,
    items: RawInvoiceItemRow[],
    cuponCategories: RawCuponCategoryRow[],
    taxPercentage: number,
  ): InvoiceTotals {
    const activeItems = items.filter((item) => !item.isReversed);
    const subtotal = round2(activeItems.reduce((sum, item) => sum + item.priceShiped * item.quantity, 0));

    let discountAmount = 0;
    if (header.idCuponApplied && header.cuponValue !== null) {
      const discountBase = header.cuponIsPerCategory
        ? round2(
            activeItems
              .filter((item) => cuponCategories.some((category) => category.idCupon === header.idCuponApplied && category.idProductType === item.idProductType))
              .reduce((sum, item) => sum + item.priceShiped * item.quantity, 0),
          )
        : subtotal;

      discountAmount =
        header.cuponTypeName === 'Monto fijo'
          ? Math.min(header.cuponValue, discountBase)
          : round2(discountBase * (header.cuponValue / 100));
    }

    const taxAmount = round2(subtotal * (taxPercentage / 100));
    const total = Math.max(0, round2(subtotal + header.shippingPrice + taxAmount - discountAmount));

    return { subtotal, shippingPrice: header.shippingPrice, taxAmount, discountAmount, total };
  }

  mapInvoiceListItem(
    header: RawInvoiceHeaderRow,
    items: RawInvoiceItemRow[],
    cuponCategories: RawCuponCategoryRow[],
    taxPercentage: number,
  ): InvoiceListItem {
    const totals = this.computeInvoiceTotals(header, items, cuponCategories, taxPercentage);

    return {
      idInvoice: header.idInvoice,
      invoiceNumber: header.invoiceNumber,
      documentNumber: header.documentNumber,
      invoiceDate: header.invoiceDate,
      idShipmentStatus: header.idShipmentStatus,
      shipmentStatusName: header.shipmentStatusName,
      shippmentGuide: header.shippmentGuide,
      cuponCode: header.cuponCode,
      ...totals,
    };
  }

  mapInvoiceDetail(
    header: RawInvoiceHeaderRow,
    items: RawInvoiceItemRow[],
    cuponCategories: RawCuponCategoryRow[],
    taxPercentage: number,
  ): InvoiceDetailResponse {
    const listItem = this.mapInvoiceListItem(header, items, cuponCategories, taxPercentage);

    return {
      ...listItem,
      addressLine1: header.addressLine1,
      addressLine2: header.addressLine2,
      idShippmentMethod: header.idShippmentMethod,
      shippmentMethodName: header.shippmentMethodName,
      isPayVDelivered: header.isPayVDelivered,
      items: items.map((item) => ({
        idProductVariant: item.idProductVariant,
        sku: item.sku,
        productName: item.productName,
        quantity: item.quantity,
        priceShiped: item.priceShiped,
        lineTotal: round2(item.priceShiped * item.quantity),
        isReversed: item.isReversed,
      })),
    };
  }
}
