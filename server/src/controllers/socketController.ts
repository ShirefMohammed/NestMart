import { Server as IOServer, Socket as IOSocket } from "socket.io";

import {
  Message,
  MessageNotification,
  OrderNotification,
} from "@shared/types/entitiesTypes";

export const socketController = (io: IOServer, socket: IOSocket) => {
  console.log(`New connection has socket id: {${socket.id}}`);

  socket.on("setup", (userId: number) => {
    // Join socket room based on user ID
    socket.join(userId.toString());
    console.log(`User with id {${userId}} joined socket`);
  });

  socket.on("joinChat", (chatId: number) => {
    // Join socket room for the specified chat room
    socket.join(chatId.toString());
    console.log(`User joined chat room with id: {${chatId}}`);
  });

  socket.on("sendMessage", (message: Message) => {
    socket.to(message.chatId.toString()).emit("receiveMessage", message);
  });

  socket.on("deleteMessage", (message: Message) => {
    socket.to(message.chatId.toString()).emit("deleteMessage", message);
  });

  socket.on("typing", (chatId: number) => {
    socket.to(chatId.toString()).emit("typing", chatId);
  });

  socket.on("stopTyping", (chatId: number) => {
    socket.to(chatId.toString()).emit("stopTyping", chatId);
  });

  socket.on("checkUserConnected", (userId: number) => {
    const socketsInRoom = io.of("/").adapter.rooms.get(userId.toString());
    const isConnected = socketsInRoom ? socketsInRoom.size > 0 : false;
    socket.emit("checkUserConnected", { userId, isConnected });
  });

  socket.on(
    "sendNotification",
    (notification: MessageNotification | OrderNotification) => {
      socket
        .to(notification.receiverId.toString())
        .emit("receiveNotification", notification);
    },
  );

  socket.on("disconnect", () => {
    console.log(`User disconnected, socket id: {${socket.id}}`);
  });
};
