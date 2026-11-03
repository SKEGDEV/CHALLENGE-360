import { InventoryAdjustmentItem, PaginatedResult, ShipmentListItem } from '../../DTOs';

export interface ShipmentStatusUpdateResult {
  userEmail: string;
  userFirstName: string;
  invoiceNumber: string;
  shippmentGuide: string | null;
  newStatusName: string;
}

export interface ShipmentListFilters {
  from?: Date;
  to?: Date;
  idShipmentStatus?: number;
  idShippmentMethod?: number;
}

export interface IOperatorRepository {
  adjustInventory(idUser: number, items: InventoryAdjustmentItem[]): Promise<void>;
  updateShipmentStatus(invoiceNumber: string, deliveryGuide: string | undefined): Promise<ShipmentStatusUpdateResult>;
  getShipments(
    pageNumber: number,
    pageSize: number,
    filters: ShipmentListFilters,
  ): Promise<PaginatedResult<ShipmentListItem>>;
}
