import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";

import { Chat } from "@shared/types/entitiesTypes";

import { chatsAPI } from "../../../../api/chatsAPI";
import { useHandleErrors, useNotify } from "../../../../hooks";
import style from "./ChatInformation.module.css";

const ChatInformation = ({
  selectedChat,
  chats,
  setChats,
  isCurrentUserCustomer,
  setOpenChatInfo,
}) => {
  const [deleteChatLoad, setDeleteChatLoad] = useState<boolean>(false);

  const handleErrors = useHandleErrors();
  const notify = useNotify();
  const navigate = useNavigate();

  // Delete this chat
  const DeleteTheChat = async () => {
    try {
      setDeleteChatLoad(true);

      await chatsAPI.deleteChat(selectedChat._id);

      setChats(chats.filter((chat: Chat) => chat._id !== selectedChat._id));

      notify("success", "Chat is deleted");

      setOpenChatInfo(false);

      if (isCurrentUserCustomer) {
        navigate("/");
      } else {
        navigate("/chat");
      }
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteChatLoad(false);
    }
  };

  return (
    <div className={style.chat_info}>
      <div className={style.container}>
        {/* Title */}
        <h2>Chat Information</h2>

        {/* Close btn */}
        <button
          type="button"
          title="close"
          className={style.close_btn}
          onClick={() => setOpenChatInfo(false)}
        >
          <FontAwesomeIcon icon={faX} />
        </button>

        {/* Chat controllers */}
        <div className={style.chat_controllers}>
          <h3>Controllers</h3>

          <button
            type="button"
            className={style.delete_chat_btn}
            disabled={deleteChatLoad ? true : false}
            style={deleteChatLoad ? { cursor: "revert", opacity: ".5" } : {}}
            onClick={DeleteTheChat}
          >
            <span>Delete this chat</span>
            {deleteChatLoad ? <PuffLoader color="#fff" size={10} /> : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInformation;
