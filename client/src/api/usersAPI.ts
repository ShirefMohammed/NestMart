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

  async deleteUser(userId: number): Promise<void> {
    await axiosPrivate.delete(`users/${userId}`);
  }
}

export const usersAPI = new UsersAPI();
