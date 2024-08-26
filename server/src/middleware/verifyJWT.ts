import jwt from "jsonwebtoken";

import { db } from "../database";
import { ExpressHandler } from "../types/requestHandlerTypes";
import { httpStatusText } from "../utils/httpStatusText";

export const verifyJWT: ExpressHandler<null, null> = async (req, res, next) => {
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization; // "Bearer token"

  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      statusText: httpStatusText.FAIL,
      message: "Invalid access token",
    });
  }

  const token = authHeader.split(" ")[1]; // ["Bearer", "token"]

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!,
    async (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).json({
          statusText: httpStatusText.AccessTokenExpiredError,
          message: "Invalid or expired access token",
        });
      }

      const isUserExisted = await db.findUserById(
        decoded?.userInfo?._id,
        "_id",
      );

      if (!isUserExisted) {
        return res.status(404).json({
          statusText: httpStatusText.FAIL,
          message: "Your account is not found",
        });
      }

      res.locals.userInfo = decoded.userInfo;
      next();
    },
  );
};
