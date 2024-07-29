import jwt from "jsonwebtoken";

export const generateVerificationToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.VERIFICATION_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
};
