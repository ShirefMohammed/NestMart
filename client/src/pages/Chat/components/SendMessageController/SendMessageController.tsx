import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { PuffLoader } from "react-spinners";

import { CreateMessageRequest, CreateMessageResponse } from "@shared/types/apiTypes";

import { chatsAPI } from "../../../../api/chatsAPI";
import { useHandleErrors, useNotify } from "../../../../hooks";
import style from "./SendMessageController.module.css";

const SendMessageController = ({ messages, setMessages, socket }) => {
  const { chatId } = useParams();
  const [newMessageContent, setNewMessageContent] = useState<string>("");
  const [sendMessageLoad, setSendMessageLoad] = useState<boolean>(false);

  const handleErrors = useHandleErrors();
  const notify = useNotify();

  // Send message
  const sendMessage = async (e: any) => {
    e.preventDefault();

    try {
      setSendMessageLoad(true);

      if (!newMessageContent) return notify("info", "Enter message content");

      const reqBody: CreateMessageRequest = { content: newMessageContent };

      const res = await chatsAPI.createMessage(+chatId!, reqBody);

      const data: CreateMessageResponse = res.data.data;

      setMessages([...messages, data.message]);

      socket.emit("sendMessage", data.message);

      socket.emit("sendNotification", data.messageNotification);

      setNewMessageContent("");
    } catch (err) {
      handleErrors(err);
    } finally {
      setSendMessageLoad(false);
    }
  };

  return (
    <form className={style.send_message}>
      <textarea
        name="message"
        id="message"
        placeholder="Send new message"
        value={newMessageContent}
        onChange={(e) => setNewMessageContent(e.target.value)}
        onKeyDown={() => socket.emit("typing", +chatId!)}
        onKeyUp={() => socket.emit("stopTyping", +chatId!)}
      ></textarea>

      <button
        type="submit"
        title="send"
        className={style.submit_btn}
        disabled={sendMessageLoad ? true : false}
        style={sendMessageLoad ? { cursor: "revert" } : {}}
        onClick={sendMessage}
      >
        {sendMessageLoad ? (
          <PuffLoader color="#000" size={22} />
        ) : (
          <FontAwesomeIcon icon={faPaperPlane} />
        )}
      </button>
    </form>
  );
};

export default SendMessageController;
