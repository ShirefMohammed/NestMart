export interface CartsDao {
  findCartProduct(userId: number, productId: number): Promise<any>;

  addToCart(userId: number, productId: number): Promise<void>;

  removeFromCart(userId: number, productId: number): Promise<void>;

  removeAllFromCart(userId: number): Promise<void>;

  removeProductFromCarts(productId: number): Promise<void>;

  getCartProducts(userId: number, selectedFields?: string): Promise<any[]>;
}
