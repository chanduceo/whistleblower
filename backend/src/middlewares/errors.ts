import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err?.status) return res.status(err.status).json({ error: err.message });
  res.status(500).json({ error: "Server error" });
}