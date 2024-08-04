import { LoginRequest, LoginResponse } from "@shared/types/apiTypes";

import axios from "./axios";

class AuthAPI {
  async login(reqBody: LoginRequest): Promise<{ resData: LoginResponse; message: string }> {
    const res = await axios.post(`/auth/login`, reqBody, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    const resData: LoginResponse = res.data?.data;

    return { resData, message: res.data?.message };
  }
}

export const authAPI = new AuthAPI();
