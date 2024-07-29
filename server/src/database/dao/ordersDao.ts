import { OrderItem } from "@shared/types/entitiesTypes";

export interface OrdersDao {
  findOrderById(orderId: number, selectOrderItems: boolean): Promise<any>;

  createOrder(
    userId: number,
    orderItems: Pick<OrderItem, "productId" | "quantity" | "totalPrice">[],
  ): Promise<any>;

  deleteOrder(orderId: number): Promise<void>;

  getOrders(userId: number): Promise<any[]>;
}
