import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { HttpError } from "./error-handler.js";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new HttpError(400, result.error.issues.map((issue) => issue.message).join(", ")));
      return;
    }
    req.body = result.data;
    next();
  };
}
