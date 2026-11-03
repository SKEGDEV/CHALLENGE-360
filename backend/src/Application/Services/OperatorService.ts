import {
  AdjustInventoryRequest,
  CustomException,
  ErrorDictionary,
  ICommonHelper,
  IOperatorHelper,
  IOperatorRepository,
  IOperatorService,
  ISqsQueueService,
  ShipmentListQuery,
  ShipmentListResponseData,
  ShipmentStatusUpdateResult,
  StandardResponse,
  SuccessDictionary,
  UpdateShipmentStatusRequest,
} from '@Core';

export class OperatorService implements IOperatorService {
  constructor(
    private readonly operatorRepository: IOperatorRepository,
    private readonly operatorHelper: IOperatorHelper,
    private readonly commonHelper: ICommonHelper,
    private readonly sqsQueueService: ISqsQueueService | undefined,
    private readonly notificationQueueUrl: string | undefined,
  ) {}

  async adjustInventory(idUser: number, data: AdjustInventoryRequest): Promise<StandardResponse<null>> {
    await this.operatorRepository.adjustInventory(idUser, data.inventory).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('VARIANT_NOT_FOUND')) {
        throw new CustomException(404, 'OP0004', ErrorDictionary.OP0004);
      }
      if (message.includes('NEGATIVE_INVENTORY')) {
        throw new CustomException(409, 'OP0001', ErrorDictionary.OP0001);
      }
      throw error;
    });

    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0011);
  }

  async updateShipmentStatus(data: UpdateShipmentStatusRequest): Promise<StandardResponse<null>> {
    const result = await this.operatorRepository
      .updateShipmentStatus(data.invoiceNumber, data.deliveryGuide)
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('INVOICE_NOT_FOUND')) {
          throw new CustomException(404, 'OP0002', ErrorDictionary.OP0002);
        }
        if (message.includes('GUIDE_REQUIRED')) {
          throw new CustomException(400, 'OP0005', ErrorDictionary.OP0005);
        }
        if (message.includes('INVALID_STATUS_TRANSITION')) {
          throw new CustomException(409, 'OP0003', ErrorDictionary.OP0003);
        }
        throw error;
      });

    await this.enqueueShipmentNotification(result);

    return this.commonHelper.buildResponse(200, null, SuccessDictionary.OK0012);
  }

  private async enqueueShipmentNotification(result: ShipmentStatusUpdateResult): Promise<void> {
    if (!this.sqsQueueService || !this.notificationQueueUrl) {
      console.warn('Shipment notification queue is not configured; skipping notification enqueue.');
      return;
    }

    const message = this.operatorHelper.buildShipmentNotificationMessage(result);

    await this.sqsQueueService.sendMessage(this.notificationQueueUrl, JSON.stringify(message)).catch((error: unknown) => {
      console.warn('Could not enqueue shipment status notification.', error);
    });
  }

  async getShipments(query: ShipmentListQuery): Promise<StandardResponse<ShipmentListResponseData>> {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.operatorRepository.getShipments(pageNumber, pageSize, {
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      idShipmentStatus: query.idShipmentStatus,
      idShippmentMethod: query.idShippmentMethod,
    });

    return this.commonHelper.buildResponse(200, result, SuccessDictionary.OK0006);
  }
}
