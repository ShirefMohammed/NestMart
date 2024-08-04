import { faChevronLeft, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StoreState } from "client/src/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BeatLoader, MoonLoader } from "react-spinners";

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

  // Create Chat if currentUser is not admin or superAdmin
  useEffect(() => {
    const createChat = async (customerId: number) => {
      try {
        setCreateChatLoad(true);
        const newChat = await chatsAPI.createChat(customerId);
        navigate(`/chat/${newChat._id}`);
      } catch (err) {
        handleErrors(err);
      } finally {
        setCreateChatLoad(false);
      }
    };

    if (isCurrentUserCustomer) {
      createChat(currentUser._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch selected chat
  useEffect(() => {
    const fetchSelectedChat = async () => {
      try {
        if (!chatId) return setSelectedChat(null);
        setFetchSelectedChatLoad(true);
        setSelectedChat(await chatsAPI.fetchChat(+chatId));
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchSelectedChatLoad(false);
      }
    };

    fetchSelectedChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!chatId) return;
        setFetchMessagesLoad(true);
        setMessages(await chatsAPI.fetchChatMessages(+chatId));
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchMessagesLoad(false);
      }
    };

    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // scroll to the lastNotReadMsg
  useEffect(() => {
    setTimeout(() => {
      document
        .getElementById(`message-${selectedChat?.lastNotReadMsgId}`)
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [selectedChat]);

  // Update selectedChat lastNotReadMsg to null
  useEffect(() => {
    const updateChatLastNotReadMsg = async () => {
      if (selectedChat?._id && selectedChat?.lastNotReadMsgId) {
        await chatsAPI.updateChatLastNotReadMsg(selectedChat?._id, null);
      }
    };

    updateChatLastNotReadMsg();
  }, [selectedChat, messages]);

  // Join socket chat room
  useEffect(() => {
    if (chatId) {
      socket.emit("joinChat", +chatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Receive message socket event
  useEffect(() => {
    socket.on("receiveMessage", (receivedMessage: any) => {
      if (chatId == receivedMessage.chatId) {
        setMessages((prevMessages: Message[]) => [...prevMessages, receivedMessage]);
      }
    });

    return () => {
      // Clean up the socket event listener when the component unmounts
      socket.off("receiveMessage");
    };
  }, [chatId, socket]);

  // Typing socket event
  useEffect(() => {
    socket.on("typing", (targetChatId: any) => {
      if (chatId == targetChatId) {
        setTyping(true);
      }
    });

    socket.on("stopTyping", (targetChatId: any) => {
      if (chatId == targetChatId) {
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
              <Link to={`/users/${selectedChat?.customer?._id}`} className={style.user_info}>
                <img src={selectedChat?.customer?.avatar} alt="" />
                <span>{selectedChat?.customer?.name}</span>
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
