export interface NotificationService {
  sendBidPlacedNotification(recipient: string): Promise<void>;
  sendOverbidNotification(recipient: string): Promise<void>;
}
