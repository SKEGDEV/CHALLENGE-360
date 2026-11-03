import sql, { ConnectionPool } from 'mssql';
import {
  InventoryAdjustmentItem,
  IOperatorRepository,
  PaginatedResult,
  ShipmentListFilters,
  ShipmentListItem,
  ShipmentStatusUpdateResult,
} from '@Core';

export class OperatorRepository implements IOperatorRepository {
  constructor(private readonly pool: ConnectionPool | undefined) {}

  private getPool(): ConnectionPool {
    if (!this.pool) {
      throw new Error('Database connection pool is not available');
    }
    return this.pool;
  }

  async adjustInventory(idUser: number, items: InventoryAdjustmentItem[]): Promise<void> {
    const request = this.getPool().request();
    request.input('IDUser', idUser);
    request.input(
      'ItemsJson',
      sql.NVarChar(sql.MAX),
      JSON.stringify(items.map((item) => ({ sku: item.idProductVariant, quantityToAdd: item.quantityToAdd, type: item.type }))),
    );
    await request.execute('SP_Operator_AjustarInventario');
  }

  async updateShipmentStatus(invoiceNumber: string, deliveryGuide: string | undefined): Promise<ShipmentStatusUpdateResult> {
    const request = this.getPool().request();
    request.input('InvoiceNumber', invoiceNumber);
    request.input('DeliveryGuide', deliveryGuide ?? null);

    const result = await request.execute('SP_Operator_ActualizarEstadoEnvio');
    const row = result.recordset[0];

    return {
      userEmail: row.UserEmail as string,
      userFirstName: row.UserFirstName as string,
      invoiceNumber: row.InvoiceNumber as string,
      shippmentGuide: (row.ShippmentGuide as string | null) ?? null,
      newStatusName: row.NewStatusName as string,
    };
  }

  async getShipments(
    pageNumber: number,
    pageSize: number,
    filters: ShipmentListFilters,
  ): Promise<PaginatedResult<ShipmentListItem>> {
    const request = this.getPool().request();
    request.input('PageNumber', pageNumber);
    request.input('PageSize', pageSize);
    request.input('DateFrom', filters.from ?? null);
    request.input('DateTo', filters.to ?? null);
    request.input('IDShipmentStatus', filters.idShipmentStatus ?? null);
    request.input('IDShippmentMethod', filters.idShippmentMethod ?? null);

    const result = await request.execute('SP_Operator_ObtenerEnvios');
    const rows = result.recordset as Array<Record<string, unknown>>;
    const totalCount = rows.length > 0 ? Number(rows[0].TotalCount) : 0;

    return {
      items: rows.map((row) => ({
        idInvoice: row.IDInvoice as number,
        invoiceNumber: row.InvoiceNumber as string,
        documentNumber: row.DocumentNumber as string,
        idUser: row.IDUser as number,
        addressLine1: row.AddressLine1 as string,
        addressLine2: (row.AddressLine2 as string | null) ?? null,
        invoiceDate: row.InvoiceDate as Date,
        idShipmentStatus: row.IDShipmentStatus as number,
        shipmentStatusName: row.ShippmentStatusName as string,
        idShippmentMethod: row.IDShippmmentMethod as number,
        shippmentMethodName: row.ShippmentMethodCompanyName as string,
        shippmentGuide: (row.ShippmentGuide as string | null) ?? null,
        isPayVDelivered: Boolean(row.isPayVDelivered),
      })),
      pageNumber,
      pageSize,
      totalCount,
      totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0,
    };
  }
}
