import { StoreState } from "client/src/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import { Chat } from "@shared/types/entitiesTypes";

import style from "./ChatCard.module.css";

const ChatCard = ({ chat, socket }) => {
  const { chatId } = useParams();
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const [currentChat] = useState<Chat>(chat);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);

  /* Sockets */

  useEffect(() => {
    socket.emit("checkUserConnected", currentChat.customerId);
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
  }, []);

  return (
    <Link
      to={`/chat/${currentChat._id}`}
      className={`${style.chat_card} ${+chatId! === currentChat._id ? style.active : ""}`}
    >
      <figure className={style.image_container}>
        <img src={currentChat.customer?.avatar} alt="" />
        {connectionStatus ? <div className={style.connection_status}></div> : ""}
      </figure>

      <div>
        <span className={style.name}>{currentChat.customer?.name}</span>

        <p className={style.latest_message}>
          {currentChat.lastMsg ? (
            <>
              {currentChat.lastMsg?.senderId === currentUser._id ? "You: " : ""}
              {currentChat.lastMsg?.content.length > 25
                ? currentChat.lastMsg?.content.substring(0, 25) + "..."
                : currentChat.lastMsg?.content}
            </>
          ) : (
            ""
          )}
        </p>
      </div>
    </Link>
  );
};

export default ChatCard;
