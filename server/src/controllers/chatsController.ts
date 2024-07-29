import {
  CreateChatRequest,
  CreateChatResponse,
  CreateMessageRequest,
  CreateMessageResponse,
  DeleteChatRequest,
  DeleteChatResponse,
  DeleteMessageRequest,
  DeleteMessageResponse,
  GetChatMessagesRequest,
  GetChatMessagesResponse,
  GetChatRequest,
  GetChatResponse,
  GetChatsRequest,
  GetChatsResponse,
} from "@shared/types/apiTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { httpStatusText } from "../utils/httpStatusText";

export const getChats: ExpressHandler<
  GetChatsRequest,
  GetChatsResponse
> = async (_req, res, next) => {
  try {
    const chats = await db.getChats(res.locals.userInfo._id);

    // Handle chats users
    for (const chat of chats) {
      chat.creator = await db.findUserById(
        chat.creatorId,
        "_id, name, email, avatar",
      );

      chat.creator.avatar = createImagesUrl("avatars", [
        chat.creator.avatar,
      ])[0];

      chat.guest = await db.findUserById(
        chat.guestId,
        "_id, name, email, avatar",
      );

      chat.guest.avatar = createImagesUrl("avatars", [chat.guest.avatar])[0];

      // Deleting undesired fields
      delete chat.creatorId;
      delete chat.guestId;
    }

    return res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { chats },
    });
  } catch (err) {
    next(err);
  }
};

export const getChat: ExpressHandler<GetChatRequest, GetChatResponse> = async (
  req,
  res,
  next,
) => {
  try {
    const chat = await db.findChatById(+req.params.chatId);

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.creatorId &&
      res.locals.userInfo._id !== chat.guestId
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    // Handle chat users
    chat.creator = await db.findUserById(
      chat.creatorId,
      "_id, name, email, avatar",
    );

    chat.creator.avatar = createImagesUrl("avatars", [chat.creator.avatar])[0];

    chat.guest = await db.findUserById(
      chat.guestId,
      "_id, name, email, avatar",
    );

    chat.guest.avatar = createImagesUrl("avatars", [chat.guest.avatar])[0];

    // Deleting undesired fields
    delete chat.creatorId;
    delete chat.guestId;

    return res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { chat },
    });
  } catch (err) {
    next(err);
  }
};

export const createChat: ExpressHandler<
  CreateChatRequest,
  CreateChatResponse
> = async (req, res, next) => {
  try {
    // Handle guest constraints
    if (!req.body.guestId) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "guestId is required.",
      });
    }

    if (res.locals.userInfo._id === +req.body.guestId) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Enter different guestId.",
      });
    }

    const isGuestFound = await db.findUserById(
      +req.body.guestId,
      "_id, isVerified",
    );

    if (!isGuestFound) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Guest is not found.",
      });
    }

    if (!isGuestFound.isVerified) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Guest is not verified.",
      });
    }

    const chat = await db.findChatByUsers(
      res.locals.userInfo._id,
      +req.body.guestId,
    );

    if (chat) {
      // Handle chat users
      chat.creator = await db.findUserById(
        chat.creatorId,
        "_id, name, email, avatar",
      );

      chat.creator.avatar = createImagesUrl("avatars", [
        chat.creator.avatar,
      ])[0];

      chat.guest = await db.findUserById(
        chat.guestId,
        "_id, name, email, avatar",
      );

      chat.guest.avatar = createImagesUrl("avatars", [chat.guest.avatar])[0];

      // Deleting un desired fields
      delete chat.creatorId;
      delete chat.guestId;

      return res.status(200).send({
        statusText: httpStatusText.SUCCESS,
        message: "Chat already exists.",
        data: { chat },
      });
    }

    // Create new chat
    await db.createChat(res.locals.userInfo._id, +req.body.guestId);

    const newChat = await db.findChatByUsers(
      res.locals.userInfo._id,
      +req.body.guestId,
    );

    // Handle chat users
    newChat.creator = await db.findUserById(
      newChat.creatorId,
      "_id, name, email, avatar",
    );

    newChat.creator.avatar = createImagesUrl("avatars", [
      newChat.creator.avatar,
    ])[0];

    newChat.guest = await db.findUserById(
      newChat.guestId,
      "_id, name, email, avatar",
    );

    newChat.guest.avatar = createImagesUrl("avatars", [
      newChat.guest.avatar,
    ])[0];

    // Deleting un desired fields
    delete newChat.creatorId;
    delete newChat.guestId;

    return res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message: "Chat is created.",
      data: { chat: newChat },
    });
  } catch (err) {
    next(err);
  }
};

// TODO: Delete chat messages notifications
export const deleteChat: ExpressHandler<
  DeleteChatRequest,
  DeleteChatResponse
> = async (req, res, next) => {
  try {
    const chat = await db.findChatById(+req.params.chatId);

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.creatorId &&
      res.locals.userInfo._id !== chat.guestId
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    await db.deleteChatMessages(chat._id);

    await db.deleteChat(chat._id);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// TODO: Add lastMsg and lastNotReadMsg to the chat
export const getChatMessages: ExpressHandler<
  GetChatMessagesRequest,
  GetChatMessagesResponse
> = async (req, res, next) => {
  try {
    const chat = await db.findChatById(+req.params.chatId);

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.creatorId &&
      res.locals.userInfo._id !== chat.guestId
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const messages = await db.getChatMessages(+req.params.chatId);

    return res.status(300).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { messages },
    });
  } catch (err) {
    next(err);
  }
};

export const createMessage: ExpressHandler<
  CreateMessageRequest,
  CreateMessageResponse
> = async (req, res, next) => {
  try {
    if (!req.body.content) {
      return res.status(400).send({
        statusText: httpStatusText.FAIL,
        message: "Message content is required.",
      });
    }

    const chat = await db.findChatById(+req.params.chatId);

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.creatorId &&
      res.locals.userInfo._id !== chat.guestId
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const newMessage = await db.createMessage(
      chat._id,
      res.locals.userInfo._id,
      req.body.content,
    );

    return res.status(401).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { message: newMessage },
    });
  } catch (err) {
    next(err);
  }
};

// TODO: Delete msg notification
export const deleteMessage: ExpressHandler<
  DeleteMessageRequest,
  DeleteMessageResponse
> = async (req, res, next) => {
  try {
    const message = await db.findMessageById(+req.params.messageId);

    if (!message) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Message is not found.",
      });
    }

    if (res.locals.userInfo._id !== message.senderId) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    await db.deleteMessage(+req.params.messageId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
