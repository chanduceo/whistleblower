import { randomBytes, createHmac } from "crypto";
import { Request, Response, NextFunction } from "express";
import { CONFIG } from "../config";

export function issueCsrfToken(_: Request, res: Response) {
  const token = randomBytes(16).toString("hex");
  const sig = createHmac("sha256", CONFIG.csrfSecret).update(token).digest("hex");
  res.cookie("csrf", `${token}.${sig}`, { httpOnly: false, sameSite: "lax" });
  res.json({ csrfToken: token });
}

export function verifyCsrf(req: Request, res: Response, next: NextFunction) {
  const cookie = req.cookies?.csrf;
  const header = req.headers["x-csrf-token"] as string;
  if (!cookie || !header) return res.status(403).json({ error: "CSRF" });
  const [token, sig] = cookie.split(".");
  const expected = createHmac("sha256", CONFIG.csrfSecret).update(token).digest("hex");
  if (sig !== expected || header !== token) return res.status(403).json({ error: "CSRF" });
  next();
}