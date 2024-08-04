import { SearchUsersResponse } from "@shared/types/apiTypes";
import { User } from "@shared/types/entitiesTypes";

import { axiosPrivate } from "./axios";

class UsersAPI {
  async searchUsers(searchKey: string, limit: number): Promise<User[]> {
    const res = await axiosPrivate.get(`users/search?searchKey=${searchKey}&limit=${limit}`);
    const data: SearchUsersResponse = res.data.data;
    return data.users;
  }
}

export const usersAPI = new UsersAPI();
