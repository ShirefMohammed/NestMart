import {
  CreateChatResponse,
  CreateMessageResponse,
  GetChatMessagesResponse,
  GetChatResponse,
  GetChatsResponse,
  UpdateChatRequest,
} from "@shared/types/apiTypes";
import { Chat } from "@shared/types/entitiesTypes";

import { axiosPrivate } from "./axios";

class ChatsAPI {
  async createChat(customerId?: number): Promise<Chat> {
    const res = await axiosPrivate.post(`/chats`, {
      customerId: customerId,
    });
    const data: CreateChatResponse = res.data.data;
    return data.chat;
  }

  async updateChatLastNotReadMsg(chatId: number, lastNotReadMsgId: number | null): Promise<void> {
    const reqData: UpdateChatRequest = { lastNotReadMsgId };
    await axiosPrivate.patch(`/chats/${chatId}`, reqData);
  }

  async deleteChat(chatId: number): Promise<void> {
    await axiosPrivate.delete(`/chats/${chatId}`);
  }

  async fetchUserChats(): Promise<Chat[]> {
    const res = await axiosPrivate.get(`/chats`);
    const data: GetChatsResponse = res.data.data;
    return data.chats;
  }

  async fetchChat(chatId: number): Promise<Chat> {
    const res = await axiosPrivate.get(`/chats/${chatId}`);
    const data: GetChatResponse = res.data.data;
    return data.chat;
  }

  async fetchChatMessages(chatId: number) {
    const res = await axiosPrivate.get(`/chats/${chatId}/messages`);
    const data: GetChatMessagesResponse = res.data.data;
    return data.messages;
  }

  async createMessage(chatId: number, newMessageContent: string) {
    const res = await axiosPrivate.post(`chats/${chatId}/messages`, {
      content: newMessageContent,
    });
    const data: CreateMessageResponse = res.data.data;
    return data.message;
  }
}

export const chatsAPI = new ChatsAPI();
