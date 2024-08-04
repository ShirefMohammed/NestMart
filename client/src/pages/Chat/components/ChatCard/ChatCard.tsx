import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Chat } from "@shared/types/entitiesTypes";

import style from "./ChatCard.module.css";

const ChatCard = ({ chat, socket }) => {
  const { chatId } = useParams();
  const [currentChat] = useState<Chat>(chat);
  const [connectionStatus, setConnectionStatus] = useState(false);

  useEffect(() => {
    socket.emit("checkUserConnected", currentChat.customerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on("checkUserConnected", ({ userId, isConnected }) => {
      if (isConnected && userId === currentChat.customerId) {
        setConnectionStatus(true);
      }
    });

    return () => {
      socket.off("checkUserConnected");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Link
      to={`/chat/${chat._id}`}
      className={`${style.chat_card} ${chatId === chat._id ? style.active : ""}`}
    >
      <figure className={style.image_container}>
        <img src={currentChat.customer?.avatar} alt="" />
        {connectionStatus ? <div className={style.connection_status}></div> : ""}
      </figure>

      <span className={style.guest_name}>{currentChat.customer?.name}</span>
    </Link>
  );
};

export default ChatCard;
