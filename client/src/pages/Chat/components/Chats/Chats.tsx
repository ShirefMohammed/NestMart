import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";

import { Chat } from "@shared/types/entitiesTypes";

import { useHandleErrors } from "../../../../hooks";
import { StoreState } from "../../../../store/store";
import ChatCard from "../ChatCard/ChatCard";
import CreateChat from "../CreateChat/CreateChat";
import { chatsAPI } from "./../../../../api/chatsAPI";
import style from "./Chats.module.css";

const Chats = ({ chats, setChats, socket }) => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);

  const [fetchChatsLoad, setFetchChatsLoad] = useState(false);
  const [openCreateChat, setOpenCreateChat] = useState(false);

  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  // Fetch user chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setFetchChatsLoad(true);
        setChats(await chatsAPI.fetchUserChats());
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchChatsLoad(false);
      }
    };

    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={style.chats}>
      {/* Header */}
      <header className={style.header}>
        <button type="button" onClick={() => navigate("/")} title="home">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <Link to={`/users/${currentUser?._id}`} className={style.user_info}>
          <img src={currentUser?.avatar} alt="" />
          <span>{currentUser?.name}</span>
        </Link>

        <button type="button" onClick={() => setOpenCreateChat(true)} title="create">
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </header>

      {/* Chats list */}
      <section className={style.chats_list}>
        <h2>Chats</h2>

        {fetchChatsLoad ? (
          <div className={style.spinner_container}>
            <MoonLoader color="#000" size={20} />
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat: Chat) => <ChatCard key={chat._id} chat={chat} socket={socket} />)
        ) : chats.length === 0 ? (
          <div className={style.no_chats_msg}>No chats have been created yet</div>
        ) : (
          ""
        )}
      </section>

      {/* Create new chat */}
      {openCreateChat ? (
        <CreateChat chats={chats} setChats={setChats} setOpenCreateChat={setOpenCreateChat} />
      ) : (
        ""
      )}
    </section>
  );
};

export default Chats;
