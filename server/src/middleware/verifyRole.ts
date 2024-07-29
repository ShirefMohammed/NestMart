import { NextFunction, Request, Response } from "express";

import { httpStatusText } from "../utils/httpStatusText";

export const verifyRole = (...allowedRoles: number[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(res.locals?.userInfo?.role)) {
      return res.status(401).json({
        statusText: httpStatusText.FAIL,
        message: "You don't have access to this resource.",
      });
    }

    next();
  };
};
