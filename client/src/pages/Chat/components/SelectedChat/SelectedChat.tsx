import { faChevronLeft, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StoreState } from "client/src/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BeatLoader, MoonLoader } from "react-spinners";

import {
  CreateChatRequest,
  CreateChatResponse,
  GetChatMessagesResponse,
  GetChatResponse,
  UpdateChatRequest,
} from "@shared/types/apiTypes";
import { Chat, Message } from "@shared/types/entitiesTypes";

import { chatsAPI } from "../../../../api/chatsAPI";
import { useHandleErrors } from "../../../../hooks";
import { ROLES_LIST } from "../../../../utils/rolesList";
import ChatInformation from "../ChatInformation/ChatInformation";
import MessageCard from "../MessageCard/MessageCard";
import SendMessageController from "../SendMessageController/SendMessageController";
import style from "./SelectedChat.module.css";

const SelectedChat = ({ chats, setChats, socket }) => {
  const { chatId } = useParams();

  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const [isCurrentUserCustomer] = useState<boolean>(
    currentUser.role !== ROLES_LIST.Admin && currentUser.role !== ROLES_LIST.SuperAdmin,
  );
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [createChatLoad, setCreateChatLoad] = useState<boolean>(false);
  const [fetchSelectedChatLoad, setFetchSelectedChatLoad] = useState<boolean>(false);
  const [fetchMessagesLoad, setFetchMessagesLoad] = useState<boolean>(false);

  const [openChatInfo, setOpenChatInfo] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);

  const handleErrors = useHandleErrors();
  const navigate = useNavigate();
  const location = useLocation();

  // If isCurrentUserCustomer create chat and navigate to it
  useEffect(() => {
    const createChat = async (customerId: number) => {
      try {
        setCreateChatLoad(true);

        const reqBody: CreateChatRequest = { customerId: customerId };

        const res = await chatsAPI.createChat(reqBody);

        const data: CreateChatResponse = res.data.data;

        const newChat: Chat = data.chat;

        navigate(`/chat/${newChat._id}`, {
          state: { from: location },
          replace: true,
        });
      } catch (err) {
        handleErrors(err);
      } finally {
        setCreateChatLoad(false);
      }
    };

    if (isCurrentUserCustomer) createChat(currentUser._id);
  }, []);

  // Fetch selectedChat with chatId params
  useEffect(() => {
    const fetchSelectedChat = async () => {
      try {
        if (!chatId) return setSelectedChat(null);

        setFetchSelectedChatLoad(true);

        const res = await chatsAPI.fetchChat(+chatId);

        const data: GetChatResponse = res.data.data;

        setSelectedChat(data.chat);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchSelectedChatLoad(false);
      }
    };

    fetchSelectedChat();
  }, [chatId]);

  // Fetch selectedChat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!chatId) return;

        setFetchMessagesLoad(true);

        const res = await chatsAPI.fetchChatMessages(+chatId);

        const data: GetChatMessagesResponse = res.data.data;

        setMessages(data.messages);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchMessagesLoad(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  // If isCurrentUserCustomer scroll to the lastNotReadMsg else scroll to lastMsg
  useEffect(() => {
    if (isCurrentUserCustomer && selectedChat?.lastNotReadMsgId) {
      setTimeout(() => {
        document
          .getElementById(`message-${selectedChat?.lastNotReadMsgId}`)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else {
      setTimeout(() => {
        document
          .getElementById(`message-${selectedChat?.lastMsgId}`)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [selectedChat]);

  // If isCurrentUserCustomer update selectedChat.lastNotReadMsg to null
  useEffect(() => {
    const updateChatLastNotReadMsg = async () => {
      if (!selectedChat?._id) return;
      const reqBody: UpdateChatRequest = { lastNotReadMsgId: null };
      await chatsAPI.updateChatLastNotReadMsg(selectedChat._id, reqBody);
    };

    if (isCurrentUserCustomer && selectedChat?.lastNotReadMsgId) {
      updateChatLastNotReadMsg();
    }

    return () => {
      if (isCurrentUserCustomer) {
        updateChatLastNotReadMsg();
      }
    };
  }, [selectedChat?._id]);

  /* Sockets Events */

  // Current app socket Joins to chatId room
  useEffect(() => {
    if (chatId) {
      socket.emit("joinChat", +chatId);
    }
  }, [chatId]);

  // Receive message socket event
  useEffect(() => {
    socket.on("receiveMessage", (receivedMessage: Message) => {
      if (chatId && +chatId === receivedMessage.chatId) {
        setMessages((prevMessages: Message[]) => [...prevMessages, receivedMessage]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [chatId, socket]);

  // Delete message socket event
  useEffect(() => {
    socket.on("deleteMessage", (deletedMessage: Message) => {
      if (chatId && +chatId === deletedMessage.chatId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg: Message) => msg._id !== deletedMessage._id),
        );
      }
    });

    return () => {
      socket.off("deleteMessage");
    };
  }, [chatId, socket]);

  // Typing socket event
  useEffect(() => {
    socket.on("typing", (targetChatId: number) => {
      if (chatId && +chatId === targetChatId) {
        setTyping(true);
      }
    });

    socket.on("stopTyping", (targetChatId: number) => {
      if (chatId && +chatId === targetChatId) {
        setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [chatId, socket]);

  return (
    <>
      {createChatLoad || fetchSelectedChatLoad || fetchMessagesLoad ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : selectedChat?._id ? (
        <section className={style.selected_chat}>
          {/* Header */}
          <header className={style.header}>
            <button
              type="button"
              className={isCurrentUserCustomer ? style.customer : style.not_customer}
              onClick={() => (isCurrentUserCustomer ? navigate("/") : navigate("/chat"))}
              title={isCurrentUserCustomer ? "go home" : "go back"}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            {!isCurrentUserCustomer ? (
              <Link to={`/users/${selectedChat.customer?._id}/profile`} className={style.user_info}>
                <img src={selectedChat.customer?.avatar} alt="" />
                <span>{selectedChat.customer?.name}</span>
                <div className={style.typing}>
                  {typing ? <BeatLoader color="#888" size={8} /> : ""}
                </div>
              </Link>
            ) : (
              <div className={style.typing}>
                {typing ? <BeatLoader color="#888" size={8} /> : ""}
              </div>
            )}

            <button type="button" onClick={() => setOpenChatInfo(true)} title="chat info">
              <FontAwesomeIcon icon={faCircleInfo} />
            </button>
          </header>

          {/* Messages */}
          <section className={style.chat_messages_viewer}>
            {messages.length === 0 ? (
              <div className={style.no_messages}>No messages have been sent yet</div>
            ) : (
              messages.map((message: any, index: number) => (
                <MessageCard
                  key={message._id}
                  message={message}
                  index={index}
                  messages={messages}
                  setMessages={setMessages}
                  socket={socket}
                />
              ))
            )}
          </section>

          {/* SendMessageController Component */}
          <SendMessageController messages={messages} setMessages={setMessages} socket={socket} />

          {/* ChatInformation Component */}
          {openChatInfo ? (
            <ChatInformation
              selectedChat={selectedChat}
              chats={chats}
              setChats={setChats}
              isCurrentUserCustomer={isCurrentUserCustomer}
              setOpenChatInfo={setOpenChatInfo}
            />
          ) : (
            ""
          )}
        </section>
      ) : (
        <div className={style.no_chats_msg}>Select chat to start sending messages</div>
      )}
    </>
  );
};

export default SelectedChat;
