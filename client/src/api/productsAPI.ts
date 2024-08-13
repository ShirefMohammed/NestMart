import { axiosPrivate } from "./axios";

class ProductsAPI {
  async getProducts(
    page: number = 1,
    limit: number = 10,
    order: "old" | "new" = "new",
  ): Promise<any> {
    return await axiosPrivate.get(`products?page=${page}&limit=${limit}&order=${order}`);
  }

  async searchProducts(
    searchKey: string,
    page: number = 1,
    limit: number = 10,
    order: "old" | "new" = "new",
  ): Promise<any> {
    return await axiosPrivate.get(
      `products/search?searchKey=${searchKey}&page=${page}&limit=${limit}&order=${order}`,
    );
  }

  async getProduct(productId: number): Promise<any> {
    return await axiosPrivate.get(`products/${productId}`);
  }

  async createProduct(reqBody: FormData): Promise<any> {
    return await axiosPrivate.post(`products`, reqBody, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  }

  async updateProduct(productId: number, reqBody: FormData): Promise<any> {
    return await axiosPrivate.patch(`products/${productId}`, reqBody, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  }

  async deleteProduct(productId: number): Promise<void> {
    await axiosPrivate.delete(`products/${productId}`);
  }
}

export const productsAPI = new ProductsAPI();
