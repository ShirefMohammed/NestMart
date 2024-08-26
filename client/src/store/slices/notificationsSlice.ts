import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { MessageNotification, Notifications, OrderNotification } from "@shared/types/entitiesTypes";

type NotificationsState = Notifications;

const initialState: NotificationsState = {
  messagesNotifications: [],
  ordersNotifications: [],
};

const notificationsSlice = createSlice({
  name: "notificationsSlice",
  initialState: initialState,
  reducers: {
    setNotifications: (_, action: PayloadAction<NotificationsState>) => {
      return action.payload;
    },

    pushNotification: (state, action: PayloadAction<MessageNotification | OrderNotification>) => {
      if ("messageId" in action.payload) {
        state.messagesNotifications = [
          action.payload,
          ...state.messagesNotifications.filter(
            (item) =>
              item.senderId === action.payload.senderId &&
              item.receiverId === action.payload.receiverId &&
              item.createdAt < 24 * 60 * 60 * 1000,
          ),
        ];
      } else if ("orderId" in action.payload) {
        state.ordersNotifications.unshift(action.payload);
      }
    },

    updateNotification: (
      state,
      action: PayloadAction<{ notificationId: number; type: "message" | "order"; isRead: boolean }>,
    ) => {
      if (action.payload.type === "message") {
        state.messagesNotifications = state.messagesNotifications.map((item) =>
          item._id !== action.payload.notificationId
            ? item
            : { ...item, isRead: action.payload.isRead },
        );
      } else if (action.payload.type === "order") {
        state.ordersNotifications = state.ordersNotifications.map((item) =>
          item._id !== action.payload.notificationId
            ? item
            : { ...item, isRead: action.payload.isRead },
        );
      }
    },

    deleteNotification: (
      state,
      action: PayloadAction<{ notificationId: number; type: "message" | "order" }>,
    ) => {
      if (action.payload.type === "message") {
        state.messagesNotifications = state.messagesNotifications.filter(
          (item) => item._id !== action.payload.notificationId,
        );
      } else if (action.payload.type === "order") {
        state.ordersNotifications = state.ordersNotifications.filter(
          (item) => item._id !== action.payload.notificationId,
        );
      }
    },
  },
});

export const { setNotifications, pushNotification, deleteNotification, updateNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
