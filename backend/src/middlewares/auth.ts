import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config";

export interface AuthUser {
  id: string; role: "USER" | "OFFICIAL" | "ACO" | "ADMIN";
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, CONFIG.jwtSecret, { expiresIn: "8h" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const payload = jwt.verify(token, CONFIG.jwtSecret) as AuthUser;
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: AuthUser | undefined = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}