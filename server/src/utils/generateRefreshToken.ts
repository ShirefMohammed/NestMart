import jwt from "jsonwebtoken";

export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
};
