import { configureStore } from "@reduxjs/toolkit";

import { Notifications, Product, User } from "@shared/types/entitiesTypes";

import accessTokenSlice from "./slices/accessTokenSlice";
import cartSlice from "./slices/cartSlice";
import notificationsSlice from "./slices/notificationsSlice";
import userSlice from "./slices/userSlice";

const devToolsStatus = import.meta.env.VITE_NODE_ENV === "development" ? true : false;

export interface StoreState {
  currentUser: User & { persist: boolean };
  accessToken: string;
  cartProducts: Product[];
  notifications: Notifications;
}

export const store = configureStore({
  reducer: {
    currentUser: userSlice,
    accessToken: accessTokenSlice,
    cartProducts: cartSlice,
    notifications: notificationsSlice,
  },
  devTools: devToolsStatus,
});
