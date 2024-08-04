import { RequestHandler } from "express";

import { FullResBody } from "@shared/types/apiTypes";

export type ExpressHandler<ReqBody, ResBody> = RequestHandler<
  any,
  FullResBody<ResBody>,
  Partial<ReqBody>,
  any
>;

export type ExpressHandlerWithParams<Params, ReqBody, ResBody> = RequestHandler<
  Partial<Params>,
  FullResBody<ResBody>,
  Partial<ReqBody>,
  any
>;
