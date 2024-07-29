export interface CartsDao {
  findCartProduct(userId: number, productId: number): Promise<any>;

  addToCart(userId: number, productId: number): Promise<void>;

  removeFromCart(userId: number, productId: number): Promise<void>;

  getCartProducts(
    userId: number,
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]>;
}
