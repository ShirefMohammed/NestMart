import path from "path";
import { Database, open as sqliteOpen } from "sqlite";
import sqlite3 from "sqlite3";

import {
  Category,
  Chat,
  OrderItem,
  Product,
  User,
} from "@shared/types/entitiesTypes";

import { Datastore } from "..";
import { mergeOrderItems } from "../../utils/mergeOrderItems";
import { ROLES_LIST } from "../../utils/rolesList";

export class sqliteDB implements Datastore {
  private db!: Database<sqlite3.Database, sqlite3.Statement>;

  public async openDb(dbPath: string) {
    try {
      this.db = await sqliteOpen({
        filename: dbPath,
        driver: sqlite3.Database,
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      });

      console.log("Database connected");
    } catch (err) {
      console.log(err);
      process.exit(1);
    }

    this.db.run("PRAGMA foreign_keys = ON;");

    await this.db.migrate({
      migrationsPath: path.join(__dirname, "migrations"),
    });

    return this;
  }

  /* Users Operations */

  async findUserById(userId: number, selectedFields?: string): Promise<any> {
    try {
      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Users WHERE _id = ?`,
        userId,
      );
    } catch (err) {
      console.error("Error in findUserById:", err);
      throw err;
    }
  }

  async findUserByEmail(email: string, selectedFields?: string): Promise<any> {
    try {
      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Users WHERE email = ?`,
        email,
      );
    } catch (err) {
      console.error("Error in findUserByEmail:", err);
      throw err;
    }
  }

  async findSuperAdmin(selectedFields?: string): Promise<any> {
    try {
      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Users WHERE role = ?`,
        ROLES_LIST.SuperAdmin,
      );
    } catch (err) {
      console.error("Error in findSuperAdmin:", err);
      throw err;
    }
  }

  async findUserByVerificationToken(
    verificationToken: string,
    selectedFields?: string,
  ): Promise<any> {
    try {
      const user = await this.db.get(
        `SELECT userId FROM Users_Verification_Tokens WHERE verificationToken = ?`,
        verificationToken,
      );

      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Users WHERE _id = ?`,
        user?.userId,
      );
    } catch (err) {
      console.error("Error in findUserByVerificationToken:", err);
      throw err;
    }
  }

  async findUserByResetPasswordToken(
    resetPasswordToken: string,
    selectedFields?: string,
  ): Promise<any> {
    try {
      const user = await this.db.get(
        `SELECT userId FROM Users_Reset_Password_Tokens WHERE resetPasswordToken = ?`,
        resetPasswordToken,
      );

      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Users WHERE _id = ?`,
        user?.userId,
      );
    } catch (err) {
      console.error("Error in findUserByResetPasswordToken:", err);
      throw err;
    }
  }

  async createUser(user: Partial<User>): Promise<void> {
    try {
      await this.db.run(
        "INSERT INTO Users (name, email, password, role, createdAt, updatedAt) VALUES (?,?,?,?,?,?)",
        user.name,
        user.email,
        user.password,
        ROLES_LIST.User,
        Date.now(),
        Date.now(),
      );
    } catch (err) {
      console.error("Error in createUser:", err);
      throw err;
    }
  }

  async updateUser(userId: number, user: Partial<User>): Promise<void> {
    try {
      if (user.name) {
        await this.db.run(
          "UPDATE Users SET name = ? WHERE _id = ?",
          user.name,
          userId,
        );
      }

      if (user.avatar) {
        await this.db.run(
          "UPDATE Users SET avatar = ? WHERE _id = ?",
          user.avatar,
          userId,
        );
      }

      if (user.password) {
        await this.db.run(
          "UPDATE Users SET password = ? WHERE _id = ?",
          user.password,
          userId,
        );
      }

      if (user.isVerified) {
        await this.db.run(
          "UPDATE Users SET isVerified = ? WHERE _id = ?",
          Boolean(user.isVerified),
          userId,
        );
      }

      if (user.role) {
        await this.db.run(
          "UPDATE Users SET role = ? WHERE _id = ?",
          user.role,
          userId,
        );
      }

      if (user.phone) {
        await this.db.run(
          "UPDATE Users SET phone = ? WHERE _id = ?",
          user.phone,
          userId,
        );
      }

      if (user.country) {
        await this.db.run(
          "UPDATE Users SET country = ? WHERE _id = ?",
          user.country,
          userId,
        );
      }

      if (user.city) {
        await this.db.run(
          "UPDATE Users SET city = ? WHERE _id = ?",
          user.city,
          userId,
        );
      }

      await this.db.run(
        "UPDATE Users SET updatedAt = ? WHERE _id = ?",
        Date.now(),
        userId,
      );
    } catch (err) {
      console.error("Error in updateUser:", err);
      throw err;
    }
  }

  async setVerificationToken(
    userId: number,
    verificationToken: string,
  ): Promise<void> {
    try {
      if (verificationToken === "") {
        await this.db.run(
          "DELETE FROM Users_Verification_Tokens WHERE userId = ?",
          userId,
        );

        return;
      }

      const isExistedBefore = await this.db.get(
        "SELECT userId FROM Users_Verification_Tokens WHERE userId = ?",
        userId,
      );

      if (isExistedBefore) {
        await this.db.run(
          "UPDATE Users_Verification_Tokens SET verificationToken = ? WHERE userId = ?",
          verificationToken,
          userId,
        );

        return;
      }

      await this.db.run(
        "INSERT INTO Users_Verification_Tokens (userId, verificationToken) VALUES (?,?)",
        userId,
        verificationToken,
      );
    } catch (err) {
      console.error("Error in setVerificationToken:", err);
      throw err;
    }
  }

  async setResetPasswordToken(
    userId: number,
    resetPasswordToken: string,
  ): Promise<void> {
    try {
      if (resetPasswordToken === "") {
        await this.db.run(
          "DELETE FROM Users_Reset_Password_Tokens WHERE userId = ?",
          userId,
        );

        return;
      }

      const isExistedBefore = await this.db.get(
        "SELECT userId FROM Users_Reset_Password_Tokens WHERE userId = ?",
        userId,
      );

      if (isExistedBefore) {
        await this.db.run(
          "UPDATE Users_Reset_Password_Tokens SET resetPasswordToken = ? WHERE userId = ?",
          resetPasswordToken,
          userId,
        );

        return;
      }

      await this.db.run(
        "INSERT INTO Users_Reset_Password_Tokens (userId, resetPasswordToken) VALUES (?,?)",
        userId,
        resetPasswordToken,
      );
    } catch (err) {
      console.error("Error in setResetPasswordToken:", err);
      throw err;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await this.db.run(
        "DELETE FROM Users_Verification_Tokens WHERE userId = ?",
        userId,
      );

      await this.db.run(
        "DELETE FROM Users_Reset_Password_Tokens WHERE userId = ?",
        userId,
      );

      await this.db.run("DELETE FROM Users WHERE _id = ?", userId);
    } catch (err) {
      console.error("Error in deleteUser:", err);
      throw err;
    }
  }

  async getUsers(
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      return this.db.all(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Users 
        ORDER BY createdAt ${order === -1 ? "DESC" : "ASC"} 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
      );
    } catch (err) {
      console.error("Error in getUsers:", err);
      throw err;
    }
  }

  async searchUsers(
    searchKey: string,
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any[]> {
    try {
      return this.db.all(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Users 
        WHERE name LIKE ? OR email LIKE ? 
        ORDER BY createdAt ${order === -1 ? "DESC" : "ASC"} 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
        `%${searchKey}%`,
        `%${searchKey}%`,
      );
    } catch (err) {
      console.error("Error in searchUsers:", err);
      throw err;
    }
  }

  async getUnverifiedUsers(selectedFields?: string): Promise<any> {
    try {
      return this.db.all(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Users WHERE isVerified = false`,
      );
    } catch (err) {
      console.error("Error in getUnverifiedUsers:", err);
      throw err;
    }
  }

  /* Categories Operations */

  async findCategoryById(
    categoryId: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Categories WHERE _id = ?`,
        categoryId,
      );
    } catch (err) {
      console.error("Error in findCategoryById:", err);
      throw err;
    }
  }

  async findCategoryByTitle(
    title: string,
    selectedFields?: string,
  ): Promise<any> {
    try {
      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Categories WHERE title = ?`,
        title,
      );
    } catch (err) {
      console.error("Error in findCategoryByTitle:", err);
      throw err;
    }
  }

  async createCategory(category: Partial<Category>): Promise<any> {
    try {
      const result = await this.db.run(
        "INSERT INTO Categories (title, image, createdAt) VALUES (?,?,?)",
        category.title,
        category.image,
        Date.now(),
      );

      return this.findCategoryById(result.lastID!);
    } catch (err) {
      console.error("Error in createCategory:", err);
      throw err;
    }
  }

  async updateCategory(
    categoryId: number,
    category: Partial<Category>,
  ): Promise<any> {
    try {
      if (category.title) {
        await this.db.run(
          "UPDATE Categories SET title = ? WHERE _id = ?",
          category.title,
          categoryId,
        );
      }

      if (category.image) {
        await this.db.run(
          "UPDATE Categories SET image = ? WHERE _id = ?",
          category.image,
          categoryId,
        );
      }

      return this.findCategoryById(categoryId);
    } catch (err) {
      console.error("Error in updateCategory:", err);
      throw err;
    }
  }

  async deleteCategory(categoryId: number): Promise<void> {
    try {
      await this.db.run("DELETE FROM Categories WHERE _id = ?", categoryId);
    } catch (err) {
      console.error("Error in deleteCategory:", err);
      throw err;
    }
  }

  async getCategories(
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      return this.db.all(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Categories 
        ORDER BY createdAt ${order === -1 ? "DESC" : "ASC"} 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
      );
    } catch (err) {
      console.error("Error in getCategories:", err);
      throw err;
    }
  }

  searchCategories(
    searchKey: string,
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      return this.db.all(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Categories 
        WHERE title LIKE ? 
        ORDER BY createdAt ${order === -1 ? "DESC" : "ASC"} 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
        `%${searchKey}%`,
      );
    } catch (err) {
      console.error("Error in getCategories:", err);
      throw err;
    }
  }

  async getCategoryProducts(
    categoryId: number,
    order?: number,
    limit?: number,
    skip?: number,
  ): Promise<any> {
    try {
      const products = await this.db.all(
        `SELECT * FROM Products WHERE categoryId = ? 
        ORDER BY createdAt ${order === -1 ? "DESC" : "ASC"} 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
        categoryId,
      );

      for (const product of products) {
        const imagesItems = await this.db.all(
          `SELECT image FROM Products_Images WHERE productId = ?`,
          product._id,
        );

        product.images = imagesItems.map((item) => item.image);
      }

      return products;
    } catch (err) {
      console.error("Error in getCategoryProducts:", err);
      throw err;
    }
  }

  /* Products Operations */

  async findProductById(
    productId: number,
    selectedFields?: string,
    selectImages: boolean = true,
  ): Promise<any> {
    try {
      const product = await this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Products WHERE _id = ?`,
        productId,
      );

      if (selectImages && product) {
        const imagesItems = await this.db.all(
          `SELECT image FROM Products_Images WHERE productId = ?`,
          productId,
        );

        product.images = imagesItems.map((item) => item.image);
      }

      return product;
    } catch (err) {
      console.error("Error in findProductById:", err);
      throw err;
    }
  }

  async findProductByTitle(
    title: string,
    selectedFields?: string,
    selectImages: boolean = true,
  ): Promise<any> {
    try {
      const product = await this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Products WHERE title = ?`,
        title,
      );

      if (selectImages && product) {
        const imagesItems = await this.db.all(
          `SELECT image FROM Products_Images WHERE productId = ?`,
          product._id,
        );

        product.images = imagesItems.map((item) => item.image);
      }

      return product;
    } catch (err) {
      console.error("Error in findProductByTitle:", err);
      throw err;
    }
  }

  async createProduct(product: Partial<Product>): Promise<any> {
    try {
      const result = await this.db.run(
        "INSERT INTO Products (title, desc, price, createdAt, updatedAt, discount, available, categoryId) VALUES (?,?,?,?,?,?,?,?)",
        product.title,
        product.desc,
        +product.price!,
        Date.now(),
        Date.now(),
        product?.discount ? +product.discount : 0,
        +product.available!,
        +product.categoryId!,
      );

      if (!result.lastID) return null;

      for (const image of product.images!) {
        await this.db.run(
          "INSERT INTO Products_Images (productId, image) VALUES (?,?)",
          result.lastID,
          image,
        );
      }

      return this.findProductById(result.lastID);
    } catch (err) {
      console.error("Error in createProduct:", err);
      throw err;
    }
  }

  async updateProduct(
    productId: number,
    product: Partial<Product>,
  ): Promise<void> {
    try {
      if (product.title) {
        await this.db.run(
          "UPDATE Products SET title = ? WHERE _id = ?",
          product.title,
          productId,
        );
      }

      if (product.desc) {
        await this.db.run(
          "UPDATE Products SET desc = ? WHERE _id = ?",
          product.desc,
          productId,
        );
      }

      if (product.price) {
        await this.db.run(
          "UPDATE Products SET price = ? WHERE _id = ?",
          product.price,
          productId,
        );
      }

      if (product.discount) {
        await this.db.run(
          "UPDATE Products SET discount = ? WHERE _id = ?",
          product.discount,
          productId,
        );
      }

      if (product.available) {
        await this.db.run(
          "UPDATE Products SET available = ? WHERE _id = ?",
          product.available,
          productId,
        );
      }

      if (product.categoryId) {
        await this.db.run(
          "UPDATE Products SET categoryId = ? WHERE _id = ?",
          product.categoryId,
          productId,
        );
      }

      if (product.images) {
        await this.db.run(
          `DELETE FROM Products_Images WHERE productId = ?`,
          productId,
        );

        for (const image of product.images) {
          await this.db.run(
            `INSERT INTO Products_Images (productId, image) VALUES (?, ?)`,
            productId,
            image,
          );
        }
      }

      await this.db.run(
        "UPDATE Products SET updatedAt = ? WHERE _id = ?",
        Date.now(),
        productId,
      );

      return this.findProductById(productId);
    } catch (err) {
      console.error("Error in updateProduct:", err);
      throw err;
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    try {
      await this.db.run(
        "DELETE FROM Products_Images WHERE productId = ?",
        productId,
      );

      await this.db.run("DELETE FROM Products WHERE _id = ?", productId);
    } catch (err) {
      console.error("Error in deleteProduct:", err);
      throw err;
    }
  }

  async getProducts(
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      const products = await this.db.all(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Products 
        ORDER BY createdAt ${order === -1 ? "DESC" : "ASC"} 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
      );

      for (const product of products) {
        const imagesItems = await this.db.all(
          `SELECT image FROM Products_Images WHERE productId = ?`,
          product._id,
        );

        product.images = imagesItems.map((item) => item.image);
      }

      return products;
    } catch (err) {
      console.error("Error in getProducts:", err);
      throw err;
    }
  }

  async searchProducts(
    searchKey: string,
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      const products = await this.db.all(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Products 
        WHERE title LIKE ? or desc LIKE ? 
        ORDER BY createdAt ${order === -1 ? "DESC" : "ASC"} 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
        `%${searchKey}%`,
        `%${searchKey}%`,
      );

      for (const product of products) {
        const imagesItems = await this.db.all(
          `SELECT image FROM Products_Images WHERE productId = ?`,
          product._id,
        );

        product.images = imagesItems.map((item) => item.image);
      }

      return products;
    } catch (err) {
      console.error("Error in searchProducts:", err);
      throw err;
    }
  }

  /* Cart Operations */

  async findCartProduct(userId: number, productId: number): Promise<any> {
    try {
      return this.db.get(
        `SELECT * FROM Users_Carts WHERE userId = ? AND productId = ?`,
        userId,
        productId,
      );
    } catch (err) {
      console.error("Error in findCartProduct:", err);
      throw err;
    }
  }

  async addToCart(userId: number, productId: number): Promise<void> {
    try {
      await this.db.run(
        "INSERT INTO Users_Carts (userId, productId) VALUES (?,?)",
        userId,
        productId,
      );
    } catch (err) {
      console.error("Error in addToCart:", err);
      throw err;
    }
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    try {
      await this.db.run(
        "DELETE FROM Users_Carts WHERE userId = ? AND productId = ?",
        userId,
        productId,
      );
    } catch (err) {
      console.error("Error in removeFromCart:", err);
      throw err;
    }
  }

  async getCartProducts(userId: number, selectedFields?: string): Promise<any> {
    try {
      const productsIdsRows = await this.db.all(
        `SELECT productId FROM Users_Carts WHERE userId = ?`,
        userId,
      );

      // Extract product IDs
      const productsIds = productsIdsRows.map((row) => row.productId);

      // If no product IDs are found, return an empty array early
      if (productsIds.length === 0) {
        return [];
      }

      // Construct the query for products
      const productsQuery = `
        SELECT ${selectedFields ? selectedFields : "*"} 
        FROM Products 
        WHERE _id IN (${productsIds.map(() => "?").join(",")})
      `;

      const products = await this.db.all(productsQuery, ...productsIds);

      for (const product of products) {
        const imagesItems = await this.db.all(
          `SELECT image FROM Products_Images WHERE productId = ?`,
          product._id,
        );

        product.images = imagesItems.map((item) => item.image);
      }

      return products;
    } catch (err) {
      console.error("Error in getCartProducts:", err);
      throw err;
    }
  }

  /* Orders Operations */

  async findOrderById(
    orderId: number,
    selectOrderItems: boolean = false,
  ): Promise<any> {
    try {
      const order = await this.db.get(
        `SELECT * FROM Orders WHERE _id = ?`,
        orderId,
      );

      if (!order) return null;

      if (selectOrderItems) {
        const orderItems = await this.db.all(
          `SELECT * FROM Orders_Items WHERE orderId = ?`,
          orderId,
        );

        for (const item of orderItems) {
          item.product = await this.findProductById(item.productId);
        }

        order.orderItems = orderItems;
      }

      return order;
    } catch (err) {
      console.error("Error in findOrderById:", err);
      throw err;
    }
  }

  async createOrder(
    creatorId: number,
    orderItems: Pick<OrderItem, "productId" | "quantity" | "totalPrice">[],
  ): Promise<any> {
    try {
      if (
        orderItems &&
        orderItems instanceof Array &&
        orderItems.length === 0
      ) {
        return;
      }

      let totalOrderPrice = 0;

      orderItems = mergeOrderItems(orderItems as OrderItem[]);

      for (const orderItem of orderItems) {
        const orderItemProduct = await this.findProductById(
          orderItem.productId,
          "price, discount",
          false,
        );

        orderItem.totalPrice =
          +orderItem.quantity *
          (+orderItemProduct.price -
            (+orderItemProduct.discount / 100) * +orderItemProduct.price);

        totalOrderPrice += orderItem.totalPrice;
      }

      if (!totalOrderPrice || totalOrderPrice === 0) return;

      const result = await this.db.run(
        "INSERT INTO Orders (creatorId, totalPrice, createdAt) VALUES (?,?,?)",
        creatorId,
        totalOrderPrice,
        Date.now(),
      );

      for (const orderItem of orderItems) {
        await this.db.run(
          "INSERT INTO Orders_Items (orderId, productId, quantity, totalPrice) VALUES (?,?,?,?)",
          result.lastID,
          +orderItem.productId,
          +orderItem.quantity,
          +orderItem.totalPrice,
        );
      }

      return this.db.get("SELECT * FROM Orders WHERE _id = ?", result.lastID);
    } catch (err) {
      console.error("Error in createOrder:", err);
      throw err;
    }
  }

  async deleteOrder(orderId: number): Promise<void> {
    try {
      await this.db.run("DELETE FROM Orders_Items WHERE orderId = ?", orderId);
      await this.db.run("DELETE FROM Orders WHERE _id = ?", orderId);
    } catch (err) {
      console.error("Error in deleteOrder:", err);
      throw err;
    }
  }

  async deleteOrderNotification(orderId: number): Promise<void> {
    try {
      await this.db.run(
        "DELETE FROM Orders_Notifications WHERE orderId = ?",
        orderId,
      );
    } catch (err) {
      console.error("Error in deleteOrderNotification:", err);
      throw err;
    }
  }

  async getOrders(userId: number): Promise<any> {
    try {
      return this.db.all(`SELECT * FROM Orders WHERE creatorId = ?`, userId);
    } catch (err) {
      console.error("Error in getOrders:", err);
      throw err;
    }
  }

  async getAllOrders(
    order?: number,
    limit?: number,
    skip?: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      const orders = await this.db.all(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Orders 
        ORDER BY createdAt ${order === -1 ? "DESC" : "ASC"} 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
      );

      for (const order of orders) {
        order.creator = await this.findUserById(
          order.creatorId,
          "_id, name, email, avatar, role, phone, country, city",
        );
      }

      return orders;
    } catch (err) {
      console.error("Error in getAllOrders:", err);
      throw err;
    }
  }

  /* Chat Operations */

  async findChatById(chatId: number, selectedFields?: string): Promise<any> {
    try {
      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Chats WHERE _id = ?`,
        chatId,
      );
    } catch (err) {
      console.error("Error in findChatById:", err);
      throw err;
    }
  }

  async findChatByCustomerId(
    customerId: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Chats WHERE customerId = ?`,
        customerId,
      );
    } catch (err) {
      console.error("Error in findChatByCustomerId:", err);
      throw err;
    }
  }

  async createChat(customerId: number): Promise<any> {
    try {
      const result = await this.db.run(
        "INSERT INTO Chats (customerId, updatedAt) VALUES (?,?)",
        customerId,
        Date.now(),
      );

      return this.findChatById(result.lastID!);
    } catch (err) {
      console.error("Error in createChat:", err);
      throw err;
    }
  }

  async updateChat(chatId: number, chat: Partial<Chat>): Promise<any> {
    try {
      if ("lastMsgId" in chat) {
        await this.db.run(
          "UPDATE Chats SET lastMsgId = ? WHERE _id = ?",
          chat.lastMsgId,
          chatId,
        );
      }

      if ("lastNotReadMsgId" in chat) {
        await this.db.run(
          "UPDATE Chats SET lastNotReadMsgId = ? WHERE _id = ?",
          chat.lastNotReadMsgId,
          chatId,
        );
      }

      await this.db.run(
        "UPDATE Chats SET updatedAt = ? WHERE _id = ?",
        Date.now(),
        chatId,
      );

      return this.findChatById(chatId);
    } catch (err) {
      console.error("Error in updateChat:", err);
      throw err;
    }
  }

  async deleteChat(chatId: number): Promise<void> {
    try {
      await this.db.run("DELETE FROM Chats WHERE _id = ?", chatId);
    } catch (err) {
      console.error("Error in deleteChat:", err);
      throw err;
    }
  }

  async getChats(customerId: number): Promise<any> {
    try {
      return this.db.all(
        `SELECT * FROM Chats WHERE customerId = ? ORDER BY updatedAt DESC`,
        customerId,
      );
    } catch (err) {
      console.error("Error in getChats:", err);
      throw err;
    }
  }

  async getAllChats(): Promise<any> {
    try {
      return this.db.all(`SELECT * FROM Chats ORDER BY updatedAt DESC`);
    } catch (err) {
      console.error("Error in getAllChats:", err);
      throw err;
    }
  }

  async deleteChatMessages(chatId: number): Promise<void> {
    try {
      await this.db.run("DELETE FROM Messages WHERE chatId = ?", chatId);
    } catch (err) {
      console.error("Error in deleteChatMessages:", err);
      throw err;
    }
  }

  async deleteChatMessagesNotifications(chatId: number): Promise<void> {
    try {
      // Fetch all message IDs related to the chatId
      const chatMessages = await this.db.all(
        "SELECT _id FROM Messages WHERE chatId = ?",
        chatId,
      );

      // Extract the message IDs from the fetched chat messages
      const messageIds = chatMessages.map((message) => message._id);

      // Delete notifications for all these messages
      const placeholders = messageIds.map(() => "?").join(",");
      await this.db.run(
        `DELETE FROM Messages_Notifications WHERE messageId IN (${placeholders})`,
        ...messageIds,
      );
    } catch (err) {
      console.error("Error in deleteChatMessagesNotifications:", err);
      throw err;
    }
  }

  async findMessageById(
    messageId: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      return this.db.get(
        `SELECT ${selectedFields ? selectedFields : "*"} FROM Messages WHERE _id = ?`,
        messageId,
      );
    } catch (err) {
      console.error("Error in findMessageById:", err);
      throw err;
    }
  }

  async findLastMessageBeforeTime(
    createdAt: number,
    selectedFields?: string,
  ): Promise<any> {
    try {
      return this.db.get(
        `
        SELECT ${selectedFields ? selectedFields : "*"}
        FROM Messages
        WHERE createdAt < ?
        ORDER BY createdAt DESC
        LIMIT 1
      `,
        createdAt,
      );
    } catch (err) {
      console.error("Error in findLastMessageBeforeTime:", err);
      throw err;
    }
  }

  async createMessage(
    chatId: number,
    senderId: number,
    content: string,
  ): Promise<any> {
    try {
      const result = await this.db.run(
        "INSERT INTO Messages (chatId, senderId, content, createdAt) VALUES (?,?,?,?)",
        chatId,
        senderId,
        content,
        Date.now(),
      );

      return this.db.get("SELECT * FROM Messages WHERE _id = ?", result.lastID);
    } catch (err) {
      console.error("Error in createMessage:", err);
      throw err;
    }
  }

  async deleteMessage(messageId: number): Promise<void> {
    try {
      await this.db.run("DELETE FROM Messages WHERE _id = ?", messageId);
    } catch (err) {
      console.error("Error in deleteMessage:", err);
      throw err;
    }
  }

  async deleteMessageNotification(messageId: number): Promise<void> {
    try {
      await this.db.run(
        "DELETE FROM Messages_Notifications WHERE messageId = ?",
        messageId,
      );
    } catch (err) {
      console.error("Error in deleteMessageNotification:", err);
      throw err;
    }
  }

  async getChatMessages(chatId: number): Promise<any> {
    try {
      return this.db.all(`SELECT * FROM Messages WHERE chatId = ?`, chatId);
    } catch (err) {
      console.error("Error in getChatMessages:", err);
      throw err;
    }
  }

  /* Notifications Operations */

  async findNotificationById(
    notificationId: number,
    type: "message" | "order",
    selectedFields?: string,
  ): Promise<any> {
    try {
      if (type === "message") {
        return this.db.get(
          `SELECT ${selectedFields ? selectedFields : "*"} FROM Messages_Notifications WHERE _id = ?`,
          notificationId,
        );
      }

      if (type === "order") {
        return this.db.get(
          `SELECT ${selectedFields ? selectedFields : "*"} FROM Orders_Notifications WHERE _id = ?`,
          notificationId,
        );
      }

      return null;
    } catch (err) {
      console.error("Error in findNotificationById:", err);
      throw err;
    }
  }

  async createNotification(
    senderId: number,
    receiverId: number,
    type: "message" | "order",
    referenceId: number,
  ): Promise<any> {
    try {
      let result: any;

      if (type === "message") {
        result = await this.db.run(
          `INSERT INTO Messages_Notifications (senderId, receiverId, messageId, createdAt, isRead) VALUES (?,?,?,?,?)`,
          senderId,
          receiverId,
          referenceId,
          Date.now(),
          0,
        );
      } else if (type === "order") {
        result = await this.db.run(
          `INSERT INTO Orders_Notifications (senderId, receiverId, orderId, createdAt, isRead) VALUES (?,?,?,?,?)`,
          senderId,
          receiverId,
          referenceId,
          Date.now(),
          0,
        );
      }

      const createdNotification = await this.db.get(
        `SELECT * FROM ${type === "message" ? "Messages_Notifications" : "Orders_Notifications"} 
        WHERE _id = ?`,
        result.lastID,
      );

      createdNotification.sender = await this.findUserById(
        createdNotification.senderId,
        "_id, name, email, avatar",
      );

      return createdNotification;
    } catch (err) {
      console.error("Error in createNotification:", err);
      throw err;
    }
  }

  async setNotificationAsRead(
    notificationId: number,
    type: "message" | "order",
  ): Promise<void> {
    try {
      if (type === "message") {
        await this.db.run(
          `UPDATE Messages_Notifications SET isRead = 1 WHERE _id = ?`,
          notificationId,
        );
      } else if (type === "order") {
        await this.db.run(
          `UPDATE Orders_Notifications SET isRead = 1 WHERE _id = ?`,
          notificationId,
        );
      }
    } catch (err) {
      console.error("Error in setNotificationAsRead:", err);
      throw err;
    }
  }

  async deleteNotification(
    notificationId: number,
    type: "message" | "order",
  ): Promise<void> {
    try {
      if (type === "message") {
        await this.db.run(
          `DELETE FROM Messages_Notifications WHERE _id = ?`,
          notificationId,
        );
      } else if (type === "order") {
        await this.db.run(
          `DELETE FROM Orders_Notifications WHERE _id = ?`,
          notificationId,
        );
      }
    } catch (err) {
      console.error("Error in deleteNotification:", err);
      throw err;
    }
  }

  async getNotifications(
    receiverId: number,
    limit?: number,
    skip?: number,
  ): Promise<any> {
    try {
      const messagesNotifications = await this.db.all(
        `SELECT * FROM Messages_Notifications WHERE receiverId = ? 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
        receiverId,
      );

      for (const notification of messagesNotifications) {
        notification.sender = await this.findUserById(
          notification.senderId,
          "_id, name, email, avatar",
        );
        delete notification.senderId;
      }

      const ordersNotifications = await this.db.all(
        `SELECT * FROM Orders_Notifications WHERE receiverId = ? 
        ${limit ? `LIMIT ${limit}` : ""} 
        ${skip ? `OFFSET ${skip}` : ""}`,
        receiverId,
      );

      for (const notification of ordersNotifications) {
        notification.sender = await this.findUserById(
          notification.senderId,
          "_id, name, email, avatar",
        );
        delete notification.senderId;
      }

      return {
        messages: messagesNotifications,
        orders: ordersNotifications,
      };
    } catch (err) {
      console.error("Error in getNotifications:", err);
      throw err;
    }
  }
}
