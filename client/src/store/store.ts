import { configureStore } from "@reduxjs/toolkit";

import { GetNotificationsResponse } from "@shared/types/apiTypes";
import { User } from "@shared/types/entitiesTypes";

import accessTokenSlice from "./slices/accessTokenSlice";
import notificationsSlice from "./slices/notificationsSlice";
import userSlice from "./slices/userSlice";

const devToolsStatus = import.meta.env.VITE_NODE_ENV === "development" ? true : false;

export interface StoreState {
  currentUser: User & { persist: boolean };
  accessToken: string;
  notifications: Pick<GetNotificationsResponse, "notifications">;
}

export const store = configureStore({
  reducer: {
    currentUser: userSlice,
    accessToken: accessTokenSlice,
    notifications: notificationsSlice,
  },
  devTools: devToolsStatus,
});
