import { RequestHandler } from "express";

import { createError } from "@/lib/responses";
import { NextFunction, Request, Response } from "express";

export type AuthenticatedController<TReq = {}, TRes = unknown> = (
  req: AuthenticatedRequest<TReq>,
  res: ControllerResponse<TRes>,
  next: NextFunction
) => Promise<void> | void;

export type AuthenticatedRequest<T = {}> = ControllerRequest<T> & {
  user: NonNullable<Request["user"]>;
};

export type Controller<TReq = {}, TRes = unknown> = (
  req: ControllerRequest<TReq>,
  res: ControllerResponse<TRes>,
  next: NextFunction
) => Promise<void> | void;

export type ControllerRequest<T = {}> = Request<
  T extends { params: infer P } ? P : unknown,
  unknown,
  T extends { body: infer B } ? B : unknown,
  T extends { query: infer Q } ? Q : unknown
>;

export type ControllerResponse<T = unknown> = Response<T>;

export const controllerHandler = <TReq = {}, TRes = unknown>(
  fn: Controller<TReq, TRes>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req as ControllerRequest<TReq>, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export const authenticatedControllerHandler = <TReq = {}, TRes = unknown>(
  fn: AuthenticatedController<TReq, TRes>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw createError.Unauthorized("Authentication required");
      }
      await fn(req as AuthenticatedRequest<TReq>, res, next);
    } catch (error) {
      next(error);
    }
  };
};
