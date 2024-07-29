import { NextFunction, Request, Response } from "express";

import { FullResBody } from "@shared/types/apiTypes";

import { allowedOrigins } from "../config/allowedOrigins";
import { httpStatusText } from "../utils/httpStatusText";

export const handleCors = (req: Request, res: Response, next: NextFunction) => {
  if (
    allowedOrigins.includes(req.headers.origin as string) ||
    process.env.NODE_ENV === "development" ||
    req.url === "/" ||
    req.url.startsWith("/api/v1/auth/verifyAccount") ||
    req.url.startsWith("/api/v1/auth/resetPassword") ||
    req.url.startsWith("/api/database/uploads")
  ) {
    next();
  } else {
    res.status(403).json({
      statusText: httpStatusText.FAIL,
      message: "Not allowed by CORS",
    } as FullResBody<null>);
  }
};
