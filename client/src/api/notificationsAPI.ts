import { DeleteNotificationRequest, UpdateNotificationRequest } from "@shared/types/apiTypes";

import { axiosPrivate } from "./axios";

class NotificationsAPI {
  async getNotifications(page: number = 1, limit: number = 10): Promise<any> {
    return await axiosPrivate.get(`notifications?page=${page}&limit=${limit}`);
  }

  async updateNotification(
    notificationId: number,
    reqBody: UpdateNotificationRequest,
  ): Promise<any> {
    return await axiosPrivate.patch(`notifications/${notificationId}`, reqBody);
  }

  async deleteNotification(
    notificationId: number,
    reqBody: DeleteNotificationRequest,
  ): Promise<void> {
    await axiosPrivate.delete(`notifications/${notificationId}`, { data: reqBody });
  }
}

export const notificationsAPI = new NotificationsAPI();
