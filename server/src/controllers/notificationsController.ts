import {
  DeleteNotificationRequest,
  DeleteNotificationResponse,
  GetNotificationsRequest,
  GetNotificationsResponse,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
} from "@shared/types/apiTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { httpStatusText } from "../utils/httpStatusText";

export const getNotifications: ExpressHandler<
  GetNotificationsRequest,
  GetNotificationsResponse
> = async (req, res, next) => {
  try {
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const page = req.query?.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const notifications = await db.getNotifications(
      res.locals.userInfo._id,
      limit,
      skip,
    );

    for (const notification of notifications.messages) {
      notification.sender.avatar = createImagesUrl("avatars", [
        notification.sender.avatar,
      ])[0];
    }

    for (const notification of notifications.orders) {
      notification.sender.avatar = createImagesUrl("avatars", [
        notification.sender.avatar,
      ])[0];
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

    const notification = await db.findNotificationById(
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
      return res.status(401).send({
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

    const notification = await db.findNotificationById(
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
      return res.status(401).send({
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
