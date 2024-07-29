import { CartsDao } from "./dao/cartsDao.js";
import { CategoriesDao } from "./dao/categoriesDao.js";
import { ChatsDao } from "./dao/chatsDao.js";
import { NotificationsDao } from "./dao/notificationsDao.js";
import { OrdersDao } from "./dao/ordersDao.js";
import { ProductsDao } from "./dao/productsDao.js";
import { UsersDao } from "./dao/usersDao.ts";
import { sqliteDB } from "./sql/index";

export interface Datastore
  extends CartsDao,
    CategoriesDao,
    ChatsDao,
    NotificationsDao,
    OrdersDao,
    ProductsDao,
    UsersDao {}

export let db: Datastore;

export async function initDb(dbPath: string) {
  db = await new sqliteDB().openDb(dbPath);
}
