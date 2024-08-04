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
  UpdateChatRequest,
  UpdateChatResponse,
} from "@shared/types/apiTypes";
import { Chat, Message, User } from "@shared/types/entitiesTypes";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { createImagesUrl } from "../utils/createImagesUrl";
import { httpStatusText } from "../utils/httpStatusText";
import { ROLES_LIST } from "../utils/rolesList";

// TODO: Remember notifications

export const getChats: ExpressHandler<
  GetChatsRequest,
  GetChatsResponse
> = async (_req, res, next) => {
  try {
    let chats: Chat[];

    if (
      res.locals.userInfo.role === ROLES_LIST.Admin ||
      res.locals.userInfo.role === ROLES_LIST.SuperAdmin
    ) {
      chats = await db.getAllChats();
    } else {
      chats = await db.getChats(res.locals.userInfo._id);
    }

    for (const chat of chats) {
      // Handle chat customer
      const customer: User = await db.findUserById(
        chat.customerId,
        "_id, name, email, avatar",
      );

      customer.avatar = createImagesUrl("avatars", [customer.avatar])[0];

      chat.customer = customer;

      // Handle chat lastMsg
      if (chat.lastMsgId) {
        chat.lastMsg = await db.findMessageById(chat.lastMsgId);
      } else {
        chat.lastMsg = null;
      }

      // Handle chat lastNotReadMsg
      if (chat.lastNotReadMsgId) {
        chat.lastNotReadMsg = await db.findMessageById(chat.lastNotReadMsgId);
      } else {
        chat.lastNotReadMsg = null;
      }
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
    const chat: Chat = await db.findChatById(+req.params.chatId);

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.customerId &&
      res.locals.userInfo.role === ROLES_LIST.Admin &&
      res.locals.userInfo.role === ROLES_LIST.SuperAdmin
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    // Handle chat customer
    const customer: User = await db.findUserById(
      chat.customerId,
      "_id, name, email, avatar",
    );

    customer.avatar = createImagesUrl("avatars", [customer.avatar])[0];

    chat.customer = customer;

    // Handle chat lastMsg
    if (chat.lastMsgId) {
      chat.lastMsg = await db.findMessageById(chat.lastMsgId);
    } else {
      chat.lastMsg = null;
    }

    // Handle chat lastNotReadMsg
    if (chat.lastNotReadMsgId) {
      chat.lastNotReadMsg = await db.findMessageById(chat.lastNotReadMsgId);
    } else {
      chat.lastNotReadMsg = null;
    }

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
    let customerId: number;

    if (
      res.locals.userInfo.role === ROLES_LIST.Admin ||
      res.locals.userInfo.role === ROLES_LIST.SuperAdmin
    ) {
      if (!req.body.customerId) {
        return res.status(400).send({
          statusText: httpStatusText.FAIL,
          message: "customerId is required.",
        });
      } else if (+req.body.customerId === res.locals.userInfo._id) {
        return res.status(409).send({
          statusText: httpStatusText.FAIL,
          message: "customerId must not be admin or super admin.",
        });
      } else {
        const customer = await db.findUserById(
          +req.body.customerId,
          "_id, isVerified, role",
        );

        if (!customer) {
          return res.status(404).send({
            statusText: httpStatusText.FAIL,
            message: "customer is not found.",
          });
        }

        if (!customer.isVerified) {
          return res.status(401).send({
            statusText: httpStatusText.FAIL,
            message: "customer is not verified.",
          });
        }

        if (
          customer.role === ROLES_LIST.Admin ||
          customer.role === ROLES_LIST.SuperAdmin
        ) {
          return res.status(400).send({
            statusText: httpStatusText.FAIL,
            message: "customerId must not be admin or super admin.",
          });
        }

        customerId = +req.body.customerId;
      }
    } else {
      customerId = res.locals.userInfo._id;
    }

    const chat: Chat = await db.findChatByCustomerId(customerId);

    if (chat) {
      // Handle chat customer
      const customer: User = await db.findUserById(
        chat.customerId,
        "_id, name, email, avatar",
      );

      customer.avatar = createImagesUrl("avatars", [customer.avatar])[0];

      chat.customer = customer;

      // Handle chat lastMsg
      if (chat.lastMsgId) {
        chat.lastMsg = await db.findMessageById(chat.lastMsgId);
      } else {
        chat.lastMsg = null;
      }

      // Handle chat lastNotReadMsg
      if (chat.lastNotReadMsgId) {
        chat.lastNotReadMsg = await db.findMessageById(chat.lastNotReadMsgId);
      } else {
        chat.lastNotReadMsg = null;
      }

      return res.status(200).send({
        statusText: httpStatusText.SUCCESS,
        message: "Chat already exists.",
        data: { chat },
      });
    }

    // Create new chat
    const newChat: Chat = await db.createChat(customerId);

    // Handle newChat customer
    const customer: User = await db.findUserById(
      newChat.customerId,
      "_id, name, email, avatar",
    );

    customer.avatar = createImagesUrl("avatars", [customer.avatar])[0];

    newChat.customer = customer;

    // Handle newChat lastMsg
    if (newChat.lastMsgId) {
      newChat.lastMsg = await db.findMessageById(newChat.lastMsgId);
    } else {
      newChat.lastMsg = null;
    }

    // Handle newChat lastNotReadMsg
    if (newChat.lastNotReadMsgId) {
      newChat.lastNotReadMsg = await db.findMessageById(
        newChat.lastNotReadMsgId,
      );
    } else {
      newChat.lastNotReadMsg = null;
    }

    return res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message: "Chat is created.",
      data: { chat: newChat },
    });
  } catch (err) {
    next(err);
  }
};

export const updateChat: ExpressHandler<
  UpdateChatRequest,
  UpdateChatResponse
> = async (req, res, next) => {
  try {
    const chat: Chat = await db.findChatById(+req.params.chatId);

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.customerId &&
      res.locals.userInfo.role !== ROLES_LIST.Admin &&
      res.locals.userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const updatedChat: Chat = await db.updateChat(+req.params.chatId, {
      lastNotReadMsgId: req.body.lastNotReadMsgId,
    });

    // Handle updatedChat customer
    const customer: User = await db.findUserById(
      updatedChat.customerId,
      "_id, name, email, avatar",
    );

    customer.avatar = createImagesUrl("avatars", [customer.avatar])[0];

    updatedChat.customer = customer;

    // Handle updatedChat lastMsg
    if (updatedChat.lastMsgId) {
      updatedChat.lastMsg = await db.findMessageById(updatedChat.lastMsgId);
    } else {
      updatedChat.lastMsg = null;
    }

    // Handle updatedChat lastNotReadMsg
    if (updatedChat.lastNotReadMsgId) {
      updatedChat.lastNotReadMsg = await db.findMessageById(
        updatedChat.lastNotReadMsgId,
      );
    } else {
      updatedChat.lastNotReadMsg = null;
    }

    res.status(200).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { chat: updatedChat },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteChat: ExpressHandler<
  DeleteChatRequest,
  DeleteChatResponse
> = async (req, res, next) => {
  try {
    const chat: Chat = await db.findChatById(+req.params.chatId);

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.customerId &&
      res.locals.userInfo.role !== ROLES_LIST.Admin &&
      res.locals.userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    await db.deleteChatMessagesNotifications(chat._id);

    await db.updateChat(chat._id, {
      lastMsgId: null,
      lastNotReadMsgId: null,
    });

    await db.deleteChatMessages(chat._id);

    await db.deleteChat(chat._id);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const getChatMessages: ExpressHandler<
  GetChatMessagesRequest,
  GetChatMessagesResponse
> = async (req, res, next) => {
  try {
    const chat: Chat = await db.findChatById(+req.params.chatId);

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.customerId &&
      res.locals.userInfo.role !== ROLES_LIST.Admin &&
      res.locals.userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const messages: Message[] = await db.getChatMessages(+req.params.chatId);

    return res.status(200).send({
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

    const chat: Chat = await db.findChatById(
      +req.params.chatId,
      "_id, customerId, lastNotReadMsgId",
    );

    if (!chat) {
      return res.status(404).send({
        statusText: httpStatusText.FAIL,
        message: "Chat is not found.",
      });
    }

    if (
      res.locals.userInfo._id !== chat.customerId &&
      res.locals.userInfo.role !== ROLES_LIST.Admin &&
      res.locals.userInfo.role !== ROLES_LIST.SuperAdmin
    ) {
      return res.status(401).send({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    const newMessage = await db.createMessage(
      +req.params.chatId,
      res.locals.userInfo._id,
      req.body.content,
    );

    // Update chat lastNotReadMsgId
    if (!chat.lastNotReadMsgId) {
      await db.updateChat(+req.params.chatId, {
        lastNotReadMsgId: newMessage._id,
      });
    }

    // Update chat lastMsgId
    await db.updateChat(+req.params.chatId, {
      lastMsgId: newMessage._id,
    });

    // TODO: Create and send message notification

    return res.status(201).send({
      statusText: httpStatusText.SUCCESS,
      message: "",
      data: { message: newMessage },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMessage: ExpressHandler<
  DeleteMessageRequest,
  DeleteMessageResponse
> = async (req, res, next) => {
  try {
    const message: Message = await db.findMessageById(+req.params.messageId);

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

    const chat: Chat = await db.findChatById(
      message.chatId,
      "_id, lastMsgId, lastNotReadMsgId",
    );

    // Update chat lastMsgId
    if (message._id === chat.lastMsgId) {
      const newLastMsg: Message = await db.findLastMessageBeforeTime(
        message.createdAt,
        "_id",
      );

      await db.updateChat(chat._id, { lastMsgId: newLastMsg?._id });
    }

    // Update chat lastNotReadMsgId
    if (message._id === chat.lastNotReadMsgId) {
      const newLastNotReadMsg: Message = await db.findLastMessageBeforeTime(
        message.createdAt,
        "_id",
      );

      await db.updateChat(chat._id, {
        lastNotReadMsgId: newLastNotReadMsg?._id,
      });
    }

    await db.deleteMessageNotification(+req.params.messageId);

    await db.deleteMessage(+req.params.messageId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
