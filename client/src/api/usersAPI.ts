import { axiosPrivate } from "./axios";

class UsersAPI {
  async searchUsers(searchKey: string, limit: number): Promise<any> {
    return await axiosPrivate.get(`users/search?searchKey=${searchKey}&limit=${limit}`);
  }
}

export const usersAPI = new UsersAPI();
