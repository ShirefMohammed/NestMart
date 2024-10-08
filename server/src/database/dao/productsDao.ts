import { Product } from "@shared/types/entitiesTypes";

export interface ProductsDao {
  findProductById(
    productId: number,
    selectedFields?: string,
    selectImages?: boolean,
  ): Promise<any>;

  findProductByTitle(
    title: string,
    selectedFields?: string,
    selectImages?: boolean,
  ): Promise<any>;

  createProduct(product: Partial<Product>): Promise<any>;

  updateProduct(productId: number, product: Partial<Product>): Promise<any>;

  deleteProduct(productId: number): Promise<void>;

  getProducts(
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]>;

  searchProducts(
    searchKey: string,
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]>;
}
