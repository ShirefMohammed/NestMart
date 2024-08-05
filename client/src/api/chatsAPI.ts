import { CreateChatRequest, CreateMessageRequest, UpdateChatRequest } from "@shared/types/apiTypes";

import { axiosPrivate } from "./axios";

class ChatsAPI {
  async createChat(reqBody: CreateChatRequest): Promise<any> {
    return await axiosPrivate.post(`/chats`, reqBody);
  }

  async updateChatLastNotReadMsg(chatId: number, reqBody: UpdateChatRequest): Promise<void> {
    await axiosPrivate.patch(`/chats/${chatId}`, reqBody);
  }

  async deleteChat(chatId: number): Promise<void> {
    await axiosPrivate.delete(`/chats/${chatId}`);
  }

  async fetchUserChats(): Promise<any> {
    return await axiosPrivate.get(`/chats`);
  }

  async fetchChat(chatId: number): Promise<any> {
    return await axiosPrivate.get(`/chats/${chatId}`);
  }

  async fetchChatMessages(chatId: number): Promise<any> {
    return await axiosPrivate.get(`/chats/${chatId}/messages`);
  }

  async createMessage(chatId: number, reqBody: CreateMessageRequest): Promise<any> {
    return await axiosPrivate.post(`chats/${chatId}/messages`, reqBody);
  }

  async deleteMessage(chatId: number, messageId: number): Promise<void> {
    await axiosPrivate.delete(`chats/${chatId}/messages/${messageId}`);
  }
}

export const chatsAPI = new ChatsAPI();
