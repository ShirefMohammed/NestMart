import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StoreState } from "client/src/store/store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";

import { Message } from "@shared/types/entitiesTypes";

import { chatsAPI } from "../../../../api/chatsAPI";
import { useNotify } from "../../../../hooks";
import style from "./MessageCard.module.css";

const MessageCard = ({ message, index, messages, setMessages, socket }) => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const [currentMessage] = useState<Message>(message);
  const messageRef = useRef<any>(null);

  const [messagePosition] = useState<"right" | "left">(
    currentUser._id === currentMessage.senderId ? "right" : "left",
  );

  // Scroll to new added message
  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // check if thw next msg sender different than current msg sender
  const isMsgByDifferentSender = (index: number) => {
    if (
      index < messages.length - 1 &&
      (messages[index + 1].sender._id != messages[index].sender._id ||
        messages[index + 1].sender._id == undefined) &&
      messages[index].sender._id != currentUser._id
    ) {
      return true;
    }

    if (
      index === messages.length - 1 &&
      messages[messages.length - 1].sender._id != currentUser._id &&
      messages[messages.length - 1].sender._id
    ) {
      return true;
    }

    return false;
  };

  // Check if current msg day date not equal previous msg day date
  const isMsgInDifferentDay = (index: number) => {
    if (index === 0) {
      return true;
    }

    const currentMessageDate = new Date(messages[index].createdAt).toDateString();
    const previousMessageDate = new Date(messages[index - 1].createdAt).toDateString();

    return currentMessageDate !== previousMessageDate;
  };

  return (
    <div className={style.message_card} id={`message-${currentMessage._id}`} ref={messageRef}>
      {/* Day date */}
      {isMsgInDifferentDay(index) ? (
        <div className={style.day_date}>
          {`${new Date(currentMessage.createdAt).getDate()} 
            ${new Date(currentMessage.createdAt).toLocaleString("default", { month: "long" })} 
            ${new Date(currentMessage.createdAt).getFullYear()}`}
        </div>
      ) : (
        ""
      )}

      {/* Message */}
      <div className={`${style.message} ${messagePosition === "right" ? style.right : style.left}`}>
        {/* Sender Avatar */}
        {isMsgByDifferentSender(index) ? (
          <img
            src={currentMessage.sender?.avatar}
            className={style.sender_avatar}
            title={currentMessage.sender?.name}
            alt=""
          />
        ) : currentMessage.sender?._id != currentUser._id ? (
          <span style={{ margin: "15px" }}></span>
        ) : (
          ""
        )}

        {/* Content */}
        <div
          className={`${style.content} ${messagePosition === "right" ? style.right : style.left}`}
        >
          <pre>{currentMessage.content}</pre>
        </div>

        {/* Message Info */}
        {currentMessage.senderId === currentUser._id ? (
          <MessageInfo
            currentMessage={currentMessage}
            index={index}
            messages={messages}
            setMessages={setMessages}
            socket={socket}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

const MessageInfo = ({ currentMessage, index, messages, setMessages, socket }) => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const [openMsgInfo, setOpenMsgInfo] = useState<boolean>(false);
  const [deleteMsgLoad, setDeleteMsgLoad] = useState<boolean>(false);
  const notify = useNotify();

  // Delete this message
  const deleteMessage = async (chatId: number, messageId: number, messageIndex: number) => {
    try {
      setDeleteMsgLoad(true);

      await chatsAPI.deleteMessage(chatId, messageId);

      setMessages(messages.filter((_, i: number) => i !== messageIndex));

      notify("success", "Message is deleted");

      socket.emit("deleteMessage", currentMessage);
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Message is not deleted");
      }
    } finally {
      setDeleteMsgLoad(false);
    }
  };

  return (
    <div className={style.message_info}>
      {/* Toggle btn */}
      <button
        type="button"
        title="options"
        className={style.toggle_btn}
        onClick={() => setOpenMsgInfo((prev) => !prev)}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </button>

      {/* Options list */}
      {openMsgInfo ? (
        <ul className={`${style.list} ${style.fade_up}`}>
          {/* Message Date */}
          <li className={style.msg_date}>
            <span>
              {new Date(currentMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </li>

          {/* Delete Btn */}
          {currentMessage.senderId === currentUser._id ? (
            <li>
              <button
                type="button"
                disabled={deleteMsgLoad ? true : false}
                style={deleteMsgLoad ? { cursor: "revert" } : {}}
                onClick={() => deleteMessage(currentMessage.chatId, currentMessage._id, index)}
              >
                <span>Delete Message</span>
                {deleteMsgLoad && <PuffLoader color="#000" size={15} />}
              </button>
            </li>
          ) : (
            ""
          )}
        </ul>
      ) : (
        ""
      )}
    </div>
  );
};

export default MessageCard;
