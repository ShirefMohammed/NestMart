import { DeleteUserRequest } from "@shared/types/apiTypes";

import { axiosPrivate } from "./axios";

class UsersAPI {
  async getUsers(page: number = 1, limit: number = 10): Promise<any> {
    return await axiosPrivate.get(`users?page=${page}&limit=${limit}`);
  }

  async searchUsers(searchKey: string, page: number = 1, limit: number = 10): Promise<any> {
    return await axiosPrivate.get(
      `users/search?searchKey=${searchKey}&page=${page}&limit=${limit}`,
    );
  }

  async getUser(userId: number): Promise<any> {
    return await axiosPrivate.get(`users/${userId}`);
  }

  async updateUser(userId: number, reqBody: FormData): Promise<any> {
    return await axiosPrivate.patch(`users/${userId}`, reqBody, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  }

  async deleteUser(userId: number, password?: string): Promise<void> {
    const reqData: DeleteUserRequest = { password: password || "" };
    await axiosPrivate.delete(`users/${userId}`, { data: reqData });
  }
}

export const usersAPI = new UsersAPI();
