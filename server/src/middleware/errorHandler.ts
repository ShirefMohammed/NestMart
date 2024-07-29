import { NextFunction, Request, Response } from "express";

import { FullResBody } from "@shared/types/apiTypes";

import { httpStatusText } from "../utils/httpStatusText";

export const handleErrors = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log(`Error from server: ${err}`);

  res.status(500).json({
    statusText: httpStatusText.ERROR,
    message: "Internal server error",
  } as FullResBody<null>);
};
