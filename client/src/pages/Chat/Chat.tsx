import { StoreState } from "client/src/store/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { Chat as ChatType } from "@shared/types/entitiesTypes";

import { ROLES_LIST } from "../../utils/rolesList";
import style from "./Chat.module.css";
import Chats from "./components/Chats/Chats";
import SelectedChat from "./components/SelectedChat/SelectedChat";

// TODO: Remember messages notifications

const Chat = ({ socket }) => {
  const { chatId } = useParams();
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  /* Current user chats fetched in chats component
    also used in selectedChat component when deleting the chat in chat info */
  const [chats, setChats] = useState<ChatType[]>([]);

  return (
    <section className={style.chat_page}>
      {currentUser.role === ROLES_LIST.Admin || currentUser.role === ROLES_LIST.SuperAdmin ? (
        <section className={`${style.left_side} ${chatId !== undefined ? style.hide_md : ""}`}>
          <Chats chats={chats} setChats={setChats} socket={socket} />
        </section>
      ) : (
        ""
      )}

      <section className={`${style.right_side} ${chatId === undefined ? style.hide_md : ""}`}>
        <SelectedChat chats={chats} setChats={setChats} socket={socket} />
      </section>
    </section>
  );
};

export default Chat;
