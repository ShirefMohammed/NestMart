import { Chat } from "@shared/types/entitiesTypes";

export interface ChatsDao {
  findChatById(chatId: number, selectedFields?: string): Promise<any>;

  findChatByCustomerId(
    customerId: number,
    selectedFields?: string,
  ): Promise<any>;

  createChat(customerId: number): Promise<any>;

  updateChat(chatId: number, chat: Partial<Chat>): Promise<any>;

  deleteChat(chatId: number): Promise<void>;

  getChats(customerId: number): Promise<any>;

  getAllChats(): Promise<any>;

  deleteChatMessages(chatId: number): Promise<void>;

  deleteChatMessagesNotifications(chatId: number): Promise<void>;

  findMessageById(messageId: number, selectedFields?: string): Promise<any>;

  findLastMessageBeforeTime(
    createdAt: number,
    selectedFields?: string,
  ): Promise<any>;

  createMessage(
    chatId: number,
    senderId: number,
    content: string,
  ): Promise<any>;

  deleteMessage(messageId: number): Promise<void>;

  deleteMessageNotification(messageId: number): Promise<void>;

  getChatMessages(chatId: number): Promise<any>;
}
