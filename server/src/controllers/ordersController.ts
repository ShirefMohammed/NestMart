import {
  CreateOrderRequest,
  CreateOrderResponse,
  DeleteOrderRequest,
  DeleteOrderResponse,
  GetOrderRequest,
  GetOrderResponse,
  GetOrdersRequest,
  GetOrdersResponse,
} from "@shared/types/apiTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { httpStatusText } from "../utils/httpStatusText";
import { ROLES_LIST } from "../utils/rolesList";

export const getOrders: ExpressHandler<
  GetOrdersRequest,
  GetOrdersResponse
> = async (_req, res, next) => {
  try {
    const orders = await db.getOrders(res.locals.userInfo._id);

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

export const getOrder: ExpressHandler<
  GetOrderRequest,
  GetOrderResponse
> = async (req, res, next) => {
  try {
    const order = await db.findOrderById(+req.params.orderId, true);

    if (!order) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Order is not found.",
      });
    }

    if (res.locals.userInfo._id !== order.creatorId) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    order.items.forEach((item: any) => {
      item.product.images = createImagesUrl("products", item.product.images);
    });

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

// TODO: find super admin
export const createOrder: ExpressHandler<
  CreateOrderRequest,
  CreateOrderResponse
> = async (req, res, next) => {
  try {
    // Check order items length
    if (
      !req.body.orderItems ||
      (req.body.orderItems && req.body.orderItems.length === 0)
    ) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Order items are required.",
      });
    }

    // Check order items productId existence
    for (const orderItem of req.body.orderItems) {
      const isOrderItemProductFound = await db.findProductById(
        orderItem.productId,
        "_id",
        false,
      );

      if (!isOrderItemProductFound) {
        return res.status(400).send({
          statusText: httpStatusText.FAIL,
          message: `Product with id ${orderItem.productId} is not found.`,
        });
      }
    }

    // Create order
    const createdOrder = await db.createOrder(
      res.locals.userInfo._id,
      req.body.orderItems!,
    );

    // Create order notification
    const orderNotification = await db.createNotification(
      2, // superAdmin
      res.locals.userInfo._id,
      "order",
      createdOrder._id,
    );

    orderNotification.sender.avatar = createImagesUrl("avatars", [
      orderNotification.sender.avatar,
    ])[0];

    res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { createdOrder, orderNotification },
    });
  } catch (err) {
    next(err);
  }
};

// Delete order notification
export const deleteOrder: ExpressHandler<
  DeleteOrderRequest,
  DeleteOrderResponse
> = async (req, res, next) => {
  try {
    const order = await db.findOrderById(+req.params.orderId, false);

    if (!order) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Order is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== order.creatorId &&
      res.locals.userInfo.role !== ROLES_LIST.Admin &&
      res.locals.userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    await db.deleteOrder(+req.params.orderId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
