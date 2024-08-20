import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";

import { CreateChatRequest, CreateChatResponse, SearchUsersResponse } from "@shared/types/apiTypes";
import { Chat, User } from "@shared/types/entitiesTypes";

import { chatsAPI } from "../../../../api/chatsAPI";
import { usersAPI } from "../../../../api/usersAPI";
import { useHandleErrors, useNotify } from "../../../../hooks";
import { ROLES_LIST } from "../../../../utils/rolesList";
import style from "./CreateChat.module.css";

const CreateChat = ({ chats, setChats, setOpenCreateChat }) => {
  const [searchKey, setSearchKey] = useState<string>("");
  const [searchLoad, setSearchLoad] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]); // search results
  const [createChatLoad, setCreateChatLoad] = useState<boolean>(false);

  const handleErrors = useHandleErrors();
  const notify = useNotify();
  const navigate = useNavigate();

  // Search to get customers to for admins to chat with
  const search = async () => {
    try {
      setSearchLoad(true);

      if (!searchKey) return setUsers([]);

      const res = await usersAPI.searchUsers(searchKey, 1, 10);

      const data: SearchUsersResponse = res.data.data;

      setUsers(data.users);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSearchLoad(false);
    }
  };

  // Create chat by admins with customers
  const createChat = async (customerIndex: number) => {
    try {
      const customer: User = users[customerIndex];

      if (customer.role === ROLES_LIST.Admin || customer.role === ROLES_LIST.SuperAdmin) {
        return notify("info", "You must not choose admin or super admin.");
      }

      setCreateChatLoad(true);

      const reqBody: CreateChatRequest = { customerId: customer._id };

      const res = await chatsAPI.createChat(reqBody);

      const data: CreateChatResponse = res.data.data;

      const newChat: Chat = data.chat;

      if (!chats.some((chat: Chat) => chat._id === newChat._id)) {
        setChats([newChat, ...chats]);
      }

      navigate(`/chat/${newChat._id}`);

      setOpenCreateChat(false);
    } catch (err) {
      handleErrors(err);
    } finally {
      setCreateChatLoad(false);
    }
  };

  return (
    <section className={style.create_chat}>
      <form
        className={style.container}
        style={createChatLoad ? { overflow: "hidden" } : {}}
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        {/* Title */}
        <h2>Create Chat</h2>

        {/* Close Btn */}
        <button
          type="button"
          title="close"
          className={style.close_btn}
          onClick={() => setOpenCreateChat(false)}
        >
          <FontAwesomeIcon icon={faX} />
        </button>

        {/* Search Input */}
        <div className={style.search}>
          <input
            type="search"
            name="searchKey"
            id="searchKey"
            placeholder="Search by user name or email"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />

          <button type="button" title="search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        {/* Search Results */}
        {searchLoad ? (
          <div className={style.spinner_container}>
            <MoonLoader color="#000" size={20} />
          </div>
        ) : users?.length > 0 ? (
          <div className={style.search_result_container}>
            {users.map((user: User, index: number) => (
              <div key={index} className={style.user_card} onClick={() => createChat(index)}>
                <img src={user.avatar} alt="" />
                <span>{user.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={style.start_search_msg}>Start searching and chat</div>
        )}

        {/* Create Chat Loader */}
        {createChatLoad ? (
          <div className={style.create_chat_loading_container}>
            <MoonLoader color="#000" size={40} />
          </div>
        ) : (
          ""
        )}
      </form>
    </section>
  );
};

export default CreateChat;
