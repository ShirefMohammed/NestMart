import { Chat } from "@shared/types/entitiesTypes";

export interface ChatsDao {
  findChatById(chatId: number): Promise<any>;

  findChatByUsers(creatorId: number, guestId: number): Promise<any>;

  createChat(creatorId: number, guestId: number): Promise<void>;

  updateChat(chatId: number, _chat: Chat): Promise<void>;

  deleteChat(chatId: number): Promise<void>;

  getChats(userId: number): Promise<any>;

  deleteChatMessages(chatId: number): Promise<void>;

  findMessageById(messageId: number): Promise<any>;

  createMessage(
    chatId: number,
    senderId: number,
    content: string,
  ): Promise<any>;

  deleteMessage(messageId: number): Promise<void>;

  getChatMessages(chatId: number): Promise<any>;
}
