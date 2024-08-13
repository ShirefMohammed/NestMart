import { axiosPrivate } from "./axios";

class CategoriesAPI {
  async getCategories(
    page: number = 1,
    limit: number = 10,
    order: "old" | "new" = "new",
  ): Promise<any> {
    return await axiosPrivate.get(`categories?page=${page}&limit=${limit}&order=${order}`);
  }

  async searchCategories(
    searchKey: string,
    page: number = 1,
    limit: number = 10,
    order: "old" | "new" = "new",
  ): Promise<any> {
    return await axiosPrivate.get(
      `categories/search?searchKey=${searchKey}&page=${page}&limit=${limit}&order=${order}`,
    );
  }

  async getCategoryProducts(
    categoryId: number,
    page: number = 1,
    limit: number = 10,
    order: "old" | "new" = "new",
  ): Promise<any> {
    return await axiosPrivate.get(
      `categories/${categoryId}/products?page=${page}&limit=${limit}&order=${order}`,
    );
  }

  async getCategory(categoryId: number): Promise<any> {
    return await axiosPrivate.get(`categories/${categoryId}`);
  }

  async createCategory(reqBody: FormData): Promise<any> {
    return await axiosPrivate.post(`categories`, reqBody, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  }

  async updateCategory(categoryId: number, reqBody: FormData): Promise<any> {
    return await axiosPrivate.patch(`categories/${categoryId}`, reqBody, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  }

  async deleteCategory(categoryId: number): Promise<void> {
    await axiosPrivate.delete(`categories/${categoryId}`);
  }
}

export const categoriesAPI = new CategoriesAPI();
