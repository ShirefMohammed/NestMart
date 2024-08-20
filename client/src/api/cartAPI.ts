import { axiosPrivate } from "./axios";

class CartAPI {
  async getCartProducts(): Promise<any> {
    return await axiosPrivate.get(`cart`);
  }

  async addToCart(productId: number): Promise<any> {
    return await axiosPrivate.post(`cart/${productId}`);
  }

  async removeFromCart(productId: number): Promise<void> {
    await axiosPrivate.delete(`cart/${productId}`);
  }
}

export const cartAPI = new CartAPI();
