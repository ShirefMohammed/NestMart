import {
  DeleteNotificationRequest,
  DeleteNotificationResponse,
  GetNotificationsRequest,
  GetNotificationsResponse,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
} from "@shared/types/apiTypes";
import {
  MessageNotification,
  Notifications,
  OrderNotification,
  User,
} from "@shared/types/entitiesTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { httpStatusText } from "../utils/httpStatusText";
import { ROLES_LIST } from "../utils/rolesList";

export const getNotifications: ExpressHandler<
  GetNotificationsRequest,
  GetNotificationsResponse
> = async (req, res, next) => {
  try {
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    let receiverId: number;

    if (
      res.locals.userInfo.role === ROLES_LIST.Admin ||
      res.locals.userInfo.role === ROLES_LIST.SuperAdmin
    ) {
      const superAdmin: User = await db.findSuperAdmin("_id");
      receiverId = superAdmin._id;
    } else {
      receiverId = res.locals.userInfo._id;
    }

    const notifications: Notifications = await db.getNotifications(
      receiverId,
      limit,
      skip,
    );

    // Set messages notifications sender data
    for (const notification of notifications.messagesNotifications) {
      notification.sender = await db.findUserById(
        notification.senderId,
        "_id, name, email, avatar",
      );

      if (notification.sender) {
        notification.sender.avatar = createImagesUrl("avatars", [
          notification.sender.avatar,
        ])[0];
      }
    }

    // Set orders notifications sender data
    for (const notification of notifications.ordersNotifications) {
      notification.sender = await db.findUserById(
        notification.senderId,
        "_id, name, email, avatar",
      );

      if (notification.sender) {
        notification.sender.avatar = createImagesUrl("avatars", [
          notification.sender.avatar,
        ])[0];
      }
    }

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { notifications },
    });
  } catch (err) {
    next(err);
  }
};

export const updateNotification: ExpressHandler<
  UpdateNotificationRequest,
  UpdateNotificationResponse
> = async (req, res, next) => {
  try {
    if (req.body.type !== "message" && req.body.type !== "order") {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Notification type must be message or order.",
      });
    }

    const notification: MessageNotification | OrderNotification =
      await db.findNotificationById(
        +req.params.notificationId,
        req.body.type!,
        "receiverId",
      );

    if (!notification) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Notification is not found.",
      });
    }

    if (res.locals.userInfo._id !== notification.receiverId) {
      return res.status(403).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    if (req.body.isRead) {
      await db.setNotificationAsRead(
        +req.params.notificationId,
        req.body.type!,
      );
    }

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification: ExpressHandler<
  DeleteNotificationRequest,
  DeleteNotificationResponse
> = async (req, res, next) => {
  try {
    if (req.body.type !== "message" && req.body.type !== "order") {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Notification type must be message or order.",
      });
    }

    const notification: MessageNotification | OrderNotification =
      await db.findNotificationById(
        +req.params.notificationId,
        req.body.type!,
        "receiverId",
      );

    if (!notification) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Notification is not found.",
      });
    }

    if (res.locals.userInfo._id !== notification.receiverId) {
      return res.status(403).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    await db.deleteNotification(+req.params.notificationId, req.body.type!);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
