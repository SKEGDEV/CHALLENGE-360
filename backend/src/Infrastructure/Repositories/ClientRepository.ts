import sql, { ConnectionPool } from 'mssql';
import {
  CreatePreOrderData,
  IClientRepository,
  InvoiceDetailRawResult,
  InvoiceListFilters,
  InvoiceListRawResult,
  PreOrderItemDTO,
  RawCuponCategoryRow,
  RawInvoiceHeaderRow,
  RawInvoiceItemRow,
} from '@Core';

function mapHeaderRow(row: Record<string, unknown>): RawInvoiceHeaderRow {
  return {
    idInvoice: row.IDInvoice as number,
    invoiceNumber: row.InvoiceNumber as string,
    documentNumber: row.DocumentNumber as string,
    addressLine1: row.AddressLine1 as string,
    addressLine2: (row.AddressLine2 as string | null) ?? null,
    invoiceDate: row.InvoiceDate as Date,
    idShipmentStatus: row.IDShipmentStatus as number,
    shipmentStatusName: row.ShippmentStatusName as string,
    idShippmentMethod: row.IDShippmmentMethod as number,
    shippmentMethodName: row.ShippmentMethodCompanyName as string,
    shippingPrice: row.ShipmentPrice as number,
    shippmentGuide: (row.ShippmentGuide as string | null) ?? null,
    isPayVDelivered: Boolean(row.isPayVDelivered),
    idCuponApplied: (row.IDCuponApplied as number | null) ?? null,
    cuponCode: (row.CuponCode as string | null) ?? null,
    cuponTypeName: (row.CuponTypeName as string | null) ?? null,
    cuponValue: (row.CuponValue as number | null) ?? null,
    cuponIsPerCategory:
      row.CuponIsPerCategory === null || row.CuponIsPerCategory === undefined
        ? null
        : Boolean(row.CuponIsPerCategory),
  };
}

function mapItemRow(row: Record<string, unknown>): RawInvoiceItemRow {
  return {
    idInvoice: row.IDInvoice as number,
    idProductVariant: row.IDProductVariant as number,
    sku: row.SKU as string,
    productName: row.ProductName as string,
    idProductType: row.IDProductType as number,
    quantity: row.Quantity as number,
    priceShiped: row.PriceShiped as number,
    isReversed: Boolean(row.isReversed),
  };
}

function mapCategoryRow(row: Record<string, unknown>): RawCuponCategoryRow {
  return { idCupon: row.IDCupon as number, idProductType: row.IDProductType as number };
}

export class ClientRepository implements IClientRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}

  private getPool(): ConnectionPool {
    if (!this.pool) {
      throw new Error('Database connection pool is not available');
    }
    return this.pool;
  }

  async createPreOrder(
    idUser: number,
    data: CreatePreOrderData,
  ): Promise<{ idInvoice: number; invoiceNumber: string }> {
    const request = this.getPool().request();
    request.input('IDUser', idUser);
    request.input('IDShippmentMethod', data.idShippmentMethod);
    request.input('AddressLine1', data.addressLine1);
    request.input('AddressLine2', data.addressLine2);
    request.input(
      'ItemsJson',
      sql.NVarChar(sql.MAX),
      JSON.stringify(data.items.map((item) => ({ idProductVariant: item.idProductVariant, quantity: item.quantity }))),
    );

    const result = await request.execute('SP_Client_CrearPreOrden');
    const row = result.recordset[0];
    return { idInvoice: row.IDInvoice as number, invoiceNumber: row.InvoiceNumber as string };
  }

  async addPreOrderItem(idInvoice: number, idUser: number, item: PreOrderItemDTO): Promise<void> {
    const request = this.getPool().request();
    request.input('IDInvoice', idInvoice);
    request.input('IDUser', idUser);
    request.input('IDProductVariant', item.idProductVariant);
    request.input('Quantity', item.quantity);
    await request.execute('SP_Client_AgregarItemPreOrden');
  }

  async confirmShipment(idInvoice: number, idUser: number, cuponCode: string | null): Promise<void> {
    const request = this.getPool().request();
    request.input('IDInvoice', idInvoice);
    request.input('IDUser', idUser);
    request.input('CuponCode', cuponCode);
    await request.execute('SP_Client_ConfirmarEnvio');
  }

  async getInvoices(
    idUser: number,
    pageNumber: number,
    pageSize: number,
    filters: InvoiceListFilters,
  ): Promise<InvoiceListRawResult> {
    const request = this.getPool().request();
    request.input('IDUser', idUser);
    request.input('PageNumber', pageNumber);
    request.input('PageSize', pageSize);
    request.input('IDShipmentStatus', filters.idShipmentStatus ?? null);
    request.input('DateFrom', filters.from ?? null);
    request.input('DateTo', filters.to ?? null);

    const result = await request.execute('SP_Client_ObtenerFacturas');
    const [headerRecordset, itemRecordset, categoryRecordset] = result.recordsets as unknown as [
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
    ];

    const totalCount = headerRecordset.length > 0 ? Number(headerRecordset[0].TotalCount) : 0;

    return {
      headers: headerRecordset.map(mapHeaderRow),
      items: itemRecordset.map(mapItemRow),
      cuponCategories: categoryRecordset.map(mapCategoryRow),
      totalCount,
    };
  }

  async getInvoiceDetail(idInvoice: number, idUser: number): Promise<InvoiceDetailRawResult | null> {
    const request = this.getPool().request();
    request.input('IDInvoice', idInvoice);
    request.input('IDUser', idUser);

    const result = await request.execute('SP_Client_ObtenerFacturaDetalle');
    const [headerRecordset, itemRecordset, categoryRecordset] = result.recordsets as unknown as [
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
      Array<Record<string, unknown>>,
    ];

    const headerRow = headerRecordset[0];
    if (!headerRow) {
      return null;
    }

    return {
      header: mapHeaderRow(headerRow),
      items: itemRecordset.map(mapItemRow),
      cuponCategories: categoryRecordset.map(mapCategoryRow),
    };
  }

  async releaseExpiredPreOrders(expirationMinutes: number): Promise<number> {
    const request = this.getPool().request();
    request.input('ExpirationMinutes', expirationMinutes);
    const result = await request.execute('SP_Client_LiberarPreOrdenesExpiradas');
    return Number(result.recordset[0]?.ReleasedCount ?? 0);
  }
}
