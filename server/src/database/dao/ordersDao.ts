import { OrderItem } from "@shared/types/entitiesTypes";

export interface OrdersDao {
  findOrderById(orderId: number, selectOrderItems: boolean): Promise<any>;

  createOrder(
    creatorId: number,
    orderItems: Pick<OrderItem, "productId" | "quantity" | "totalPrice">[],
  ): Promise<any>;

  deleteOrder(orderId: number): Promise<void>;

  deleteOrderNotification(orderId: number): Promise<void>;

  getOrders(creatorId: number): Promise<any[]>;

  getAllOrders(
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]>;
}
