export interface NotificationsDao {
  findNotificationById(
    notificationId: number,
    type: "message" | "order",
    selectedFields?: string,
  ): Promise<any>;

  findLastNotification(
    senderId: number,
    receiverId: number,
    type: "message" | "order",
    selectedFields?: string,
  ): Promise<any>;

  createNotification(
    senderId: number,
    receiverId: number,
    type: "message" | "order",
    referenceId: number,
  ): Promise<any>;

  setNotificationAsRead(
    notificationId: number,
    type: "message" | "order",
  ): Promise<void>;

  deleteNotification(
    notificationId: number,
    type: "message" | "order",
  ): Promise<void>;

  deleteAllUserNotifications(userId: number): Promise<void>;

  getNotifications(
    receiverId: number,
    limit?: number,
    skip?: number,
  ): Promise<any>;
}
