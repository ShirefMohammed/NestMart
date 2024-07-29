export interface User {
  _id: number;
  name: string;
  email: string;
  password: string;
  avatar: string;
  createdAt: number;
  updatedAt: number;
  isVerified: boolean;
  role: number;
  phone?: string;
  country?: string;
  city?: string;
}

export interface UserVerificationToken {
  userId: number;
  verificationToken: string;
}

export interface UserResetPasswordToken {
  userId: number;
  resetPasswordToken: string;
}

export interface Category {
  _id: number;
  title: string;
  image: string;
  createdAt: number;
}

export interface Product {
  _id: number;
  title: string;
  desc: string;
  price: number;
  createdAt: number;
  updatedAt: number;
  discount: number; // Value between 0 and 100
  available: number;
  categoryId: number;
  images: string[];
}

export interface UserCart {
  userId: number;
  productId: number;
}

export interface Order {
  _id: number;
  creatorId: number;
  totalPrice: number;
  createdAt: number;
}

export interface OrderItem {
  orderId: number;
  productId: number;
  quantity: number;
  totalPrice: number;
}

export interface Chat {
  _id: number;
  updatedAt: number;
  creatorId: number;
  guestId: number;
}

export interface Message {
  _id: number;
  content: string;
  createdAt: number;
  chatId: number;
  senderId: number;
}

export interface MessageNotification {
  _id: number;
  isRead: boolean;
  createdAt: number;
  messageId: number;
  senderId: number;
  receiverId: number;
}

export interface OrderNotification {
  _id: number;
  isRead: boolean;
  createdAt: number;
  orderId: number;
  senderId: number;
  receiverId: number;
}
