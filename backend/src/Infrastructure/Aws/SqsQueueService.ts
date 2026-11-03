import {
  CreateQueueCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  QueueDoesNotExist,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { ISqsQueueService, SqsQueueUrls, SqsReceivedMessage } from '@Core';

export interface SqsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export class SqsQueueService implements ISqsQueueService {
  private readonly client: SQSClient;

  constructor(
    credentials: SqsCredentials,
    endpointUrl: string,
    private readonly queueName: string,
    private readonly dlqName: string,
    private readonly maxReceiveCount: number,
  ) {
    this.client = new SQSClient({
      region: credentials.region,
      endpoint: endpointUrl || undefined,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  private async getQueueUrl(queueName: string): Promise<string | undefined> {
    try {
      const result = await this.client.send(new GetQueueUrlCommand({ QueueName: queueName }));
      return result.QueueUrl;
    } catch (error) {
      if (error instanceof QueueDoesNotExist) {
        return undefined;
      }
      throw error;
    }
  }

  async ensureInfrastructure(): Promise<SqsQueueUrls> {
    let dlqUrl = await this.getQueueUrl(this.dlqName);
    if (!dlqUrl) {
      const created = await this.client.send(new CreateQueueCommand({ QueueName: this.dlqName }));
      dlqUrl = created.QueueUrl;
    }

    const dlqAttributes = await this.client.send(
      new GetQueueAttributesCommand({ QueueUrl: dlqUrl, AttributeNames: ['QueueArn'] }),
    );
    const dlqArn = dlqAttributes.Attributes?.QueueArn;

    let queueUrl = await this.getQueueUrl(this.queueName);
    if (!queueUrl) {
      const created = await this.client.send(
        new CreateQueueCommand({
          QueueName: this.queueName,
          Attributes: {
            RedrivePolicy: JSON.stringify({ deadLetterTargetArn: dlqArn, maxReceiveCount: this.maxReceiveCount }),
          },
        }),
      );
      queueUrl = created.QueueUrl;
    }

    if (!queueUrl || !dlqUrl) {
      throw new Error('Could not resolve the shipment notification queue or its dead-letter queue');
    }

    return { queueUrl, dlqUrl };
  }

  async sendMessage(queueUrl: string, body: string): Promise<void> {
    await this.client.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: body }));
  }

  async receiveMessages(queueUrl: string, maxMessages: number, waitTimeSeconds: number): Promise<SqsReceivedMessage[]> {
    const result = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: waitTimeSeconds,
      }),
    );

    return (result.Messages ?? []).map((message) => ({
      body: message.Body ?? '',
      receiptHandle: message.ReceiptHandle ?? '',
    }));
  }

  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    await this.client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle }));
  }
}
