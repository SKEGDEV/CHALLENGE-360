export interface SqsReceivedMessage {
  body: string;
  receiptHandle: string;
}

export interface SqsQueueUrls {
  queueUrl: string;
  dlqUrl: string;
}

export interface ISqsQueueService {
  ensureInfrastructure(): Promise<SqsQueueUrls>;
  sendMessage(queueUrl: string, body: string): Promise<void>;
  receiveMessages(queueUrl: string, maxMessages: number, waitTimeSeconds: number): Promise<SqsReceivedMessage[]>;
  deleteMessage(queueUrl: string, receiptHandle: string): Promise<void>;
}
