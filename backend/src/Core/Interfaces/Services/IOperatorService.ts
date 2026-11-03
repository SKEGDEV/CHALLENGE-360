import {
  AdjustInventoryRequest,
  ShipmentListQuery,
  ShipmentListResponseData,
  StandardResponse,
  UpdateShipmentStatusRequest,
} from '../../DTOs';

export interface IOperatorService {
  adjustInventory(idUser: number, data: AdjustInventoryRequest): Promise<StandardResponse<null>>;
  updateShipmentStatus(data: UpdateShipmentStatusRequest): Promise<StandardResponse<null>>;
  getShipments(query: ShipmentListQuery): Promise<StandardResponse<ShipmentListResponseData>>;
}
