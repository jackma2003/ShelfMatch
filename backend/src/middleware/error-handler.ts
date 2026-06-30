import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
