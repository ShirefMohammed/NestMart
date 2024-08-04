import { StoreState } from "client/src/store/store";
import { useState } from "react";
import { useSelector } from "react-redux";

import { Message } from "@shared/types/entitiesTypes";

import style from "./MessageCard.module.css";

const MessageCard = ({ message, index, messages }) => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const [currentMessage] = useState<Message>(message);

  // Check if messages are on the same day to display the date
  const isSameDay = (index: number) => {
    if (index === 0) {
      return true;
    }

    const currentMessageDate = new Date(messages[index].createdAt).toDateString();
    const previousMessageDate = new Date(messages[index - 1].createdAt).toDateString();

    return currentMessageDate !== previousMessageDate;
  };

  return (
    <div className={style.message_card} id={`message-${currentMessage._id}`}>
      {/* Day date */}
      {isSameDay(index) ? (
        <div className={style.day_date}>
          {`${new Date(currentMessage.createdAt).getDate()} 
            ${new Date(currentMessage.createdAt).toLocaleString("default", { month: "long" })} 
            ${new Date(currentMessage.createdAt).getFullYear()}`}
        </div>
      ) : (
        ""
      )}

      {/* Message */}
      <div
        className={`${style.message} ${message.senderId == currentUser._id ? style.right : style.left}`}
      >
        <div
          className={`${style.content} ${message.senderId === currentUser._id ? style.right : style.left}`}
        >
          <pre>{message.content}</pre>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
