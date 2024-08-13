import { axiosPrivate } from "./axios";

class OrdersAPI {
  async getAllOrders(page: number = 1, limit: number = 10): Promise<any> {
    return await axiosPrivate.get(`orders/all?page=${page}&limit=${limit}`);
  }

  async getOrder(orderId: number): Promise<any> {
    return await axiosPrivate.get(`orders/${orderId}`);
  }

  async deleteOrder(orderId: number): Promise<void> {
    await axiosPrivate.delete(`orders/${orderId}`);
  }
}

export const ordersAPI = new OrdersAPI();
