import { IOperatorHelper, ShipmentNotificationMessage, ShipmentStatusUpdateResult } from '@Core';

export class OperatorHelper implements IOperatorHelper {
  buildShipmentNotificationMessage(result: ShipmentStatusUpdateResult): ShipmentNotificationMessage {
    return {
      toEmail: result.userEmail,
      toName: result.userFirstName,
      invoiceNumber: result.invoiceNumber,
      shippmentGuide: result.shippmentGuide,
      statusName: result.newStatusName,
    };
  }
}
