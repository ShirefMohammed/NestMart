import {
  MessageNotification,
  OrderNotification,
} from "@shared/types/entitiesTypes";

export const socketController = (_io: any, socket: any) => {
  console.log(`New connection, socket id: {${socket.id}}`);

  socket.on("setup", (userId: number) => {
    socket.join(userId);
    console.log(`User joined socket, user id: {${userId}}`);
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

  console.log(socket);
};
