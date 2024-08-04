import {
  Message,
  MessageNotification,
  OrderNotification,
} from "@shared/types/entitiesTypes";

export const socketController = (io: any, socket: any) => {
  console.log(`New connection, socket id: {${socket.id}}`);

  socket.on("setup", (userId: number) => {
    // Join socket room based on user ID
    socket.join(userId);
    console.log(`User joined socket, user id: {${userId}}`);
  });

  socket.on("joinChat", (chatId: number) => {
    // Join socket room for the specified chat room
    socket.join(chatId);
    console.log(`User joined chat room, chat id: {${chatId}}`);
  });

  socket.on("sendMessage", (message: Message) => {
    socket.to(message.chatId).emit("receiveMessage", message);
  });

  socket.on("typing", (chatId: Message) => {
    socket.to(chatId).emit("typing", chatId);
  });

  socket.on("stopTyping", (chatId: Message) => {
    socket.to(chatId).emit("stopTyping", chatId);
  });

  socket.on("checkUserConnected", (userId: Message) => {
    const socketsInRoom = io.of("/").adapter.rooms.get(userId);
    const isConnected = socketsInRoom ? socketsInRoom.size > 0 : false;
    socket.emit("checkUserConnected", { userId, isConnected });
  });

  socket.on(
    "sendNotification",
    (notification: MessageNotification | OrderNotification) => {
      console.log(notification);
      if (notification.receiverId) {
        socket
          .to(notification.receiverId)
          .emit("receiveNotification", notification);
      }
    },
  );

  socket.on("disconnect", () => {
    console.log(`User disconnected, socket id: {${socket.id}}`);
  });
};
