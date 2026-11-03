export interface ShipmentNotificationMessage {
  toEmail: string;
  toName: string;
  invoiceNumber: string;
  shippmentGuide: string | null;
  statusName: string;
}

export interface ShipmentNotificationCacheEntry {
  invoiceNumber: string;
  statusName: string;
  toEmail: string;
  notifiedAt: Date;
}
