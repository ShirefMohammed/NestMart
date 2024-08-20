import { CreateOrderRequest } from "@shared/types/apiTypes";

import { axiosPrivate } from "./axios";

export interface OrderItem {
  productId: number;
  quantity: number;
}

class OrdersAPI {
  async getOrders(): Promise<any> {
    return await axiosPrivate.get(`orders`);
  }

  async getAllOrders(page: number = 1, limit: number = 10): Promise<any> {
    return await axiosPrivate.get(`orders/all?page=${page}&limit=${limit}`);
  }

  async createOrder(orderItems: OrderItem[]): Promise<any> {
    const reqBody: CreateOrderRequest = { orderItems: orderItems };
    return await axiosPrivate.post(`orders`, reqBody);
  }

  async getOrder(orderId: number): Promise<any> {
    return await axiosPrivate.get(`orders/${orderId}`);
  }

  async deleteOrder(orderId: number): Promise<void> {
    await axiosPrivate.delete(`orders/${orderId}`);
  }
}

export const ordersAPI = new OrdersAPI();
