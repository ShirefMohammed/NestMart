import { ForgetPasswordRequest, LoginRequest, RegisterRequest } from "@shared/types/apiTypes";

import axios from "./axios";

class AuthAPI {
  async login(reqBody: LoginRequest): Promise<any> {
    return await axios.post(`/auth/login`, reqBody, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
  }

  async register(reqBody: RegisterRequest): Promise<any> {
    return await axios.post(`/auth/register`, reqBody, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
  }

  async forgetPassword(reqBody: ForgetPasswordRequest): Promise<any> {
    return await axios.post(`/auth/forgetPassword`, reqBody, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
  }
}

export const authAPI = new AuthAPI();
