import jwt from "jsonwebtoken";

export const generateResetPasswordToken = (userId: number): string => {
  return jwt.sign(
    { userId },
    process.env.RESETPASSWORD_TOKEN_SECRET as string,
    {
      expiresIn: "15m",
    }
  );
};
