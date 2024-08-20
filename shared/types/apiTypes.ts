import {
  Category,
  Chat,
  Message,
  Order,
  OrderItem,
  OrderNotification,
  Product,
  User,
} from "./entitiesTypes";

// Full response body structure
export interface FullResBody<DataFieldType> {
  statusText: string;
  message: string;
  data?: DataFieldType;
}

// Access token payload type structure
export interface AccessTokenUserInfo {
  _id: number;
  role: number;
}

/* Types of the req body and res optional data field body */

// Auth
export type RegisterRequest = Pick<User, "name" | "email" | "password">;
export interface RegisterResponse {}

export type LoginRequest = Pick<User, "email" | "password">;
export interface LoginResponse {
  user: Pick<User, "_id" | "name" | "email" | "avatar" | "role">;
  accessToken: string;
}

export interface RefreshRequest {}
export interface RefreshResponse {
  user: Pick<User, "_id" | "name" | "email" | "avatar" | "role">;
  accessToken: string;
}

export type LogoutRequest = null;
export type LogoutResponse = null;

export type VerifyAccountRequest = null;
export type VerifyAccountResponse = string;

export type ForgetPasswordRequest = Pick<User, "email">;
export interface ForgetPasswordResponse {}

export type SendResetPasswordFormRequest = null;
export type SendResetPasswordFormResponse = string;

export interface ResetPasswordRequest {
  resetPasswordToken: string;
  newPassword: string;
}
export type ResetPasswordResponse = string;

// Users
export type GetUsersRequest = null;
export interface GetUsersResponse {
  users: User[];
}

export type SearchUsersRequest = null;
export interface SearchUsersResponse {
  users: User[];
}

export type GetUserRequest = null;
export interface GetUserResponse {
  user: User;
}

export type UpdateUserRequest = Pick<
  User,
  "name" | "password" | "phone" | "country" | "city"
> & {
  avatar: File;
  oldPassword: string;
};
export interface UpdateUserResponse {}

export interface DeleteUserRequest {
  password: string;
}
export interface DeleteUserResponse {}

// Categories
export type GetCategoriesRequest = null;
export interface GetCategoriesResponse {
  categories: Category[];
}

export type SearchCategoriesRequest = null;
export interface SearchCategoriesResponse {
  categories: Category[];
}

export type GetCategoryRequest = null;
export interface GetCategoryResponse {
  category: Category;
}

export type CreateCategoryRequest = Pick<Category, "title"> & { image : File };
export interface CreateCategoryResponse {
  newCategory: Category;
}

export type UpdateCategoryRequest = Pick<Category, "title"> & { image?: File };
export interface UpdateCategoryResponse {
  updatedCategory: Category;
}

export interface DeleteCategoryRequest {}
export interface DeleteCategoryResponse {}

export type GetCategoryProductsRequest = null;
export interface GetCategoryProductsResponse {
  products: Product[];
}

// Products
export type GetProductsRequest = null;
export interface GetProductsResponse {
  products: Product[];
}

export type SearchProductsRequest = null;
export interface SearchProductsResponse {
  products: Product[];
}

export type GetProductRequest = null;
export interface GetProductResponse {
  product: Product;
}

export type CreateProductRequest = Pick<
  Product,
  "title" | "desc" | "price" | "discount" | "available" | "categoryId"
> & { images: File[] };
export interface CreateProductResponse {
  newProduct: Product;
}

export type UpdateProductRequest = Pick<
  Product,
  "title" | "desc" | "price" | "discount" | "available" | "categoryId"
> & { deletedImages: string[], images: File[] };
export interface UpdateProductResponse {
  updatedProduct: Product;
}

export interface DeleteProductRequest {}
export interface DeleteProductResponse {}

// Carts
export type GetCartProductsRequest = null;
export interface GetCartProductsResponse {
  products: Product[];
}

export interface AddToCartRequest {}
export interface AddToCartResponse {
  addedProduct: Product;
}

export interface RemoveFromCartRequest {}
export interface RemoveFromCartResponse {}

// Orders
export type GetOrdersRequest = null;
export interface GetOrdersResponse {
  orders: Order[];
}

export type GetAllOrdersRequest = null;
export interface GetAllOrdersResponse {
  orders: Order[];
}

export type GetOrderRequest = null;
export interface GetOrderResponse {
  order: Order;
}

export interface CreateOrderRequest {
  orderItems: Partial<Pick<OrderItem, "productId" | "quantity" | "totalPrice">>[];
}
export interface CreateOrderResponse {
  createdOrder: Order;
  orderNotification: OrderNotification;
}

export interface DeleteOrderRequest {}
export interface DeleteOrderResponse {}

// Chats
export interface GetChatRequest {}
export interface GetChatResponse {
  chat: Chat;
}

export type CreateChatRequest = Partial<Pick<Chat, "customerId">>;
export interface CreateChatResponse {
  chat: Chat;
}

export type UpdateChatRequest = Partial<Pick<Chat, "lastNotReadMsgId">>;
export interface UpdateChatResponse {
  chat: Chat;
}

export interface DeleteChatRequest {}
export interface DeleteChatResponse {}

export interface GetChatsRequest {}
export interface GetChatsResponse {
  chats: Chat[];
}

export interface GetChatMessagesRequest {}
export interface GetChatMessagesResponse {
  messages: Message[];
}

export type CreateMessageRequest = Pick<Message, "content">;
export interface CreateMessageResponse {
  message: Message;
}

export interface DeleteMessageRequest {}
export interface DeleteMessageResponse {}

// Notifications
export interface GetNotificationsRequest {}
export interface GetNotificationsResponse {
  notifications: { messages: Notification[]; orders: Notification[] };
}

export interface UpdateNotificationRequest {
  type: "message" | "order";
  isRead: boolean;
}
export interface UpdateNotificationResponse {}

export interface DeleteNotificationRequest {
  type: "message" | "order";
}
export interface DeleteNotificationResponse {}
