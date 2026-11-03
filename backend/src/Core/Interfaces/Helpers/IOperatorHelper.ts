import { ShipmentNotificationMessage } from '../../DTOs';
import { ShipmentStatusUpdateResult } from '../Repositories/IOperatorRepository';

export interface IOperatorHelper {
  buildShipmentNotificationMessage(result: ShipmentStatusUpdateResult): ShipmentNotificationMessage;
}
