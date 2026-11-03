import {
  buildShipmentStatusEmailHtml,
  buildShipmentStatusEmailSubject,
  ICommonModuleHelper,
  IClientService,
  IEmailService,
  ISettings,
  ISqsQueueService,
  ShipmentNotificationMessage,
} from '@Core';

export class ShipmentWorker {
  private releaseIntervalHandle: NodeJS.Timeout | undefined;
  private isPolling = false;

  constructor(
    private readonly clientService: IClientService,
    private readonly commonModuleHelper: ICommonModuleHelper,
    private readonly settings: ISettings,
    private readonly sqsQueueService: ISqsQueueService | undefined,
    private readonly notificationQueueUrl: string | undefined,
    private readonly emailService: IEmailService | undefined,
  ) {}

  start(): void {
    this.releaseIntervalHandle = setInterval(() => {
      this.clientService.releaseExpiredPreOrders().catch((error: unknown) => {
        console.warn('Could not release expired pre orders.', error);
      });
    }, this.settings.preOrderWorkerIntervalMs);

    if (this.sqsQueueService && this.notificationQueueUrl && this.emailService) {
      this.isPolling = true;
      void this.pollNotificationQueue();
    } else {
      console.warn('Shipment notification queue/email service is not configured; worker will only release expired pre orders.');
    }
  }

  stop(): void {
    this.isPolling = false;
    if (this.releaseIntervalHandle) {
      clearInterval(this.releaseIntervalHandle);
    }
  }

  private async pollNotificationQueue(): Promise<void> {
    const sqsQueueService = this.sqsQueueService!;
    const queueUrl = this.notificationQueueUrl!;
    const emailService = this.emailService!;

    while (this.isPolling) {
      try {
        const messages = await sqsQueueService.receiveMessages(queueUrl, 10, this.settings.sqsWaitTimeSeconds);

        for (const message of messages) {
          await this.processMessage(message.body, emailService);
          await sqsQueueService.deleteMessage(queueUrl, message.receiptHandle).catch((error: unknown) => {
            console.warn('Could not delete processed notification message from the queue.', error);
          });
        }
      } catch (error) {
        console.warn('Could not poll the shipment notification queue.', error);
      }
    }
  }

  private async processMessage(body: string, emailService: IEmailService): Promise<void> {
    const notification = JSON.parse(body) as ShipmentNotificationMessage;

    await emailService.sendHtmlEmail(
      notification.toEmail,
      buildShipmentStatusEmailSubject(notification),
      buildShipmentStatusEmailHtml(notification),
    );

    this.commonModuleHelper.cacheShipmentNotification({
      invoiceNumber: notification.invoiceNumber,
      statusName: notification.statusName,
      toEmail: notification.toEmail,
      notifiedAt: new Date(),
    });
  }
}
