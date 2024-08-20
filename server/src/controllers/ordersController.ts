import {
  CreateOrderRequest,
  CreateOrderResponse,
  DeleteOrderRequest,
  DeleteOrderResponse,
  GetAllOrdersRequest,
  GetAllOrdersResponse,
  GetOrderRequest,
  GetOrderResponse,
  GetOrdersRequest,
  GetOrdersResponse,
} from "@shared/types/apiTypes";
import {
  Order,
  OrderItem,
  OrderNotification,
} from "@shared/types/entitiesTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { httpStatusText } from "../utils/httpStatusText";
import { ROLES_LIST } from "../utils/rolesList";

// TODO: Handle orders notifications for admins too to be like superAdmin.

export const getOrders: ExpressHandler<
  GetOrdersRequest,
  GetOrdersResponse
> = async (_req, res, next) => {
  try {
    let orders = await db.getOrders(res.locals.userInfo._id);

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders: ExpressHandler<
  GetAllOrdersRequest,
  GetAllOrdersResponse
> = async (req, res, next) => {
  try {
    const limit: number = req.query?.limit ? Number(req.query.limit) : 10;
    const page: number = req.query?.page ? Number(req.query.page) : 1;
    const skip: number = (page - 1) * limit;

    const orders: Order[] = await db.getAllOrders(-1, limit, skip);

    orders.forEach((order: Order) => {
      if (order.creator?.avatar) {
        order.creator.avatar = createImagesUrl("avatars", [
          order.creator.avatar,
        ])[0];
      }
    });

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
    const order: Order = await db.findOrderById(+req.params.orderId, true);

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

    if (order.orderItems) {
      order.orderItems.forEach((orderItem: OrderItem) => {
        if (orderItem.product?.images) {
          orderItem.product.images = createImagesUrl(
            "products",
            orderItem.product.images,
          );
        }
      });
    }

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

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
        orderItem.productId!,
        "_id",
        false,
      );

      if (!isOrderItemProductFound) {
        return res.status(404).send({
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

    const superAdmin = await db.findSuperAdmin("_id");

    // Create order notification
    const orderNotification: OrderNotification = await db.createNotification(
      superAdmin._id,
      res.locals.userInfo._id,
      "order",
      createdOrder._id,
    );

    if (orderNotification.sender) {
      orderNotification.sender.avatar = createImagesUrl("avatars", [
        orderNotification.sender.avatar,
      ])[0];
    }

    res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { createdOrder, orderNotification },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteOrder: ExpressHandler<
  DeleteOrderRequest,
  DeleteOrderResponse
> = async (req, res, next) => {
  try {
    const order: Order = await db.findOrderById(+req.params.orderId, false);

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

    await db.deleteOrderNotification(+req.params.orderId);

    await db.deleteOrder(+req.params.orderId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
