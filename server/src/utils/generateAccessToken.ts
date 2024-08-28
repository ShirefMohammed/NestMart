import jwt from "jsonwebtoken";

import { AccessTokenUserInfo } from "@shared/types/apiTypes";

export const generateAccessToken = (userId: number, role: number): string => {
  const userInfo: AccessTokenUserInfo = { _id: userId, role: role };

  return jwt.sign({ userInfo }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "1h",
  });
};
